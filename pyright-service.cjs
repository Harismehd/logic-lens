const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

// Path to pyright langserver
const LANGSERVER_PATH = path.join(__dirname, 'node_modules', '.bin', 'pyright-langserver.cmd');
const TEMP_FILE_PATH = path.join(__dirname, 'analysis_v2.py');
const TEMP_FILE_URI = pathToFileURL(TEMP_FILE_PATH).href;
const ROOT_URI = pathToFileURL(__dirname).href;

let pyrightProcess = null;
let messageId = 1;
let pendingRequests = new Map();
let latestDiagnostics = new Map(); // uri -> diagnostics

function initPyright() {
    const serverCmd = path.resolve(LANGSERVER_PATH);
    console.log('[PyrightService] Command:', serverCmd);

    pyrightProcess = spawn(`"${serverCmd}"`, ['--stdio'], {
        cwd: __dirname,
        env: process.env,
        shell: true
    });

    let buffer = '';
    pyrightProcess.stdout.on('data', (data) => {
        buffer += data.toString();
        while (true) {
            const match = buffer.match(/Content-Length: (\d+)\r\n\r\n/);
            if (!match) break;

            const contentLength = parseInt(match[1]);
            const headerLength = match[0].length;
            
            if (buffer.length < headerLength + contentLength) break;

            const content = buffer.slice(headerLength, headerLength + contentLength);
            buffer = buffer.slice(headerLength + contentLength);

            try {
                const message = JSON.parse(content);
                handleMessage(message);
            } catch (e) {
                console.error('[PyrightService] Parse error:', e);
            }
        }
    });

    pyrightProcess.stderr.on('data', (data) => {
        console.error(`[Pyright LSP Error]: ${data}`);
    });

    // Initialize
    sendRequest('initialize', {
        processId: process.pid,
        rootUri: ROOT_URI,
        capabilities: {
            textDocument: {
                completion: { completionItem: { snippetSupport: true } },
                hover: { contentFormat: ['markdown', 'plaintext'] },
                signatureHelp: { signatureInformation: { parameterInformation: { labelOffsetSupport: true } } }
            }
        },
        workspaceFolders: [{ uri: ROOT_URI, name: 'analysis' }]
    });
}

function handleMessage(msg) {
    if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve, method } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        resolve(msg.result);
        
        if (method === 'initialize') {
            sendNotification('initialized', {});
            console.log('[PyrightService] LSP Initialized and Ready.');
        }
    } else if (msg.method === 'textDocument/publishDiagnostics') {
        latestDiagnostics.set(msg.params.uri, msg.params.diagnostics);
    }
}

function sendRequest(method, params) {
    const id = messageId++;
    const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
    };
    const content = JSON.stringify(request);
    const header = `Content-Length: ${Buffer.byteLength(content, 'utf8')}\r\n\r\n`;
    
    return new Promise((resolve) => {
        pendingRequests.set(id, { resolve, method });
        pyrightProcess.stdin.write(header + content);
    });
}

function sendNotification(method, params) {
    const notification = {
        jsonrpc: '2.0',
        method,
        params
    };
    const content = JSON.stringify(notification);
    const header = `Content-Length: ${Buffer.byteLength(content, 'utf8')}\r\n\r\n`;
    pyrightProcess.stdin.write(header + content);
}

let hasOpened = false;

function syncCode(code) {
    fs.writeFileSync(TEMP_FILE_PATH, code);
    const uri = TEMP_FILE_URI;
    
    if (!hasOpened) {
        sendNotification('textDocument/didOpen', {
            textDocument: {
                uri,
                languageId: 'python',
                version: 1,
                text: code
            }
        });
        hasOpened = true;
    } else {
        sendNotification('textDocument/didChange', {
            textDocument: { uri, version: messageId },
            contentChanges: [{ text: code }]
        });
    }
}

app.post('/analyze', async (req, res) => {
    const { code } = req.body;
    syncCode(code);
    const uri = TEMP_FILE_URI;

    // Wait a bit for diagnostics to propagate (Pyright is fast but async)
    setTimeout(() => {
        const diags = latestDiagnostics.get(uri) || [];
        res.json({
            diagnostics: diags.map(d => ({
                line: d.range.start.line + 1,
                col: d.range.start.character + 1,
                message: d.message,
                severity: d.severity === 1 ? 'error' : 'warning',
                source: 'Pyright'
            }))
        });
    }, 500);
});

app.post('/complete', async (req, res) => {
    const { code, line, col } = req.body;
    if (code) syncCode(code);
    const uri = TEMP_FILE_URI;
    
    const result = await sendRequest('textDocument/completion', {
        textDocument: { uri },
        position: { line: line - 1, character: col }
    });

    res.json({
        suggestions: (result?.items || []).slice(0, 15).map(item => ({
            label: item.label,
            kind: item.kind,
            detail: item.detail,
            documentation: item.documentation,
            insertText: item.insertText || item.label
        }))
    });
});

app.post('/hover', async (req, res) => {
    const { code, line, col } = req.body;
    if (code) syncCode(code);
    const uri = TEMP_FILE_URI;
    
    const result = await sendRequest('textDocument/hover', {
        textDocument: { uri },
        position: { line: line - 1, character: col }
    });

    res.json({ hover: result });
});

app.post('/signature', async (req, res) => {
    const { code, line, col } = req.body;
    if (code) syncCode(code);
    const uri = TEMP_FILE_URI;
    
    const result = await sendRequest('textDocument/signatureHelp', {
        textDocument: { uri },
        position: { line: line - 1, character: col }
    });

    res.json({ signatureHelp: result });
});

app.listen(5000, () => {
    console.log('✓ Pyright Intelligence Service running on port 5000');
    initPyright();
});
