require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';

// Proxy for /api/generate
app.post('/api/ollama/generate', async (req, res) => {
  try {
    console.log('Request received:', req.body.prompt ? req.body.prompt.substring(0, 50) : "No prompt");
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      req.body,
      { timeout: 60000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Proxy for /api/tags (Status Check)
app.get('/api/ollama/tags', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 10000 });
    res.json(response.data);
  } catch (error) {
    console.error('Ollama tags error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('✓ Logic Lens Mentor Proxy running on port 3001'));
