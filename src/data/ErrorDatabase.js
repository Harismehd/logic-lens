export const ERROR_CONCEPTS = {
  CODE_BLOCK_SYNTAX: {
    id: 'code_block_syntax',
    name: 'Code Block Syntax',
    description: 'Python uses specific symbols to mark the start of a code block.',
    prerequisites: ['python_basics'],
    leadsTo: ['indentation']
  },
  INDENTATION: {
    id: 'indentation',
    name: 'Code Block Indentation',
    description: 'Python uses indentation to group statements together.',
    prerequisites: ['code_block_syntax'],
    leadsTo: ['control_flow']
  },
  VARIABLE_DECLARATION: {
    id: 'variable_declaration',
    name: 'Variable Declaration',
    description: 'Using variables to store and retrieve data.',
    prerequisites: ['python_basics'],
    leadsTo: ['data_types']
  },
  DATA_TYPES: {
    id: 'data_types',
    name: 'Data Types',
    description: 'Understanding strings, integers, lists, and more.',
    prerequisites: ['variable_declaration'],
    leadsTo: ['type_operations']
  },
  COMPARISON_VS_ASSIGNMENT: {
    id: 'comparison_vs_assignment',
    name: 'Comparison vs Assignment',
    description: 'Distinguishing between setting a value (=) and checking a value (==).',
    prerequisites: ['variable_declaration'],
    leadsTo: ['control_flow']
  }
};

export const ERROR_DATABASE = {
  SYNTAX_ERRORS: {
    MISSING_COLON: {
      triggers: ["expected ':'", "line.*:", "missing ':'"],
      message: "Missing ':' after code block",
      concept: ERROR_CONCEPTS.CODE_BLOCK_SYNTAX,
      explanation: "Python needs a colon (:) to mark the start of an indented code block.",
      hints: [
        "Check the end of your statement. Is there a colon?",
        "Python needs colons to mark the start of code blocks.",
        "All control flow statements need colons: if, for, while, def.",
        "Missing colons cause an IndentationError on the next line.",
        "Understanding Python's block structure is critical for all programs."
      ],
      examples: [
        { wrong: "if x > 5", right: "if x > 5:" },
        { wrong: "for i in range(10)", right: "for i in range(10):" },
        { wrong: "def greet(name)", right: "def greet(name):" }
      ],
      quickFix: (line) => line + ":"
    },
    UNEXPECTED_INDENT: {
      triggers: ["unexpected indent"],
      message: "Unexpected indentation",
      concept: ERROR_CONCEPTS.INDENTATION,
      explanation: "Code inside blocks must be indented consistently.",
      hints: [
        "Check the alignment of this line.",
        "Is this line inside a block? If not, it shouldn't be indented.",
        "Python uses spaces/tabs to know which code belongs to which block.",
        "Inconsistent indentation is the #1 cause of Python errors.",
        "Mastering indentation makes your code readable and functional."
      ],
      fix: "Remove extra spaces at the start of this line"
    },
    ASSIGNMENT_IN_CONDITION: {
      triggers: ["invalid syntax", "invalid comparison"],
      message: "Assignment in condition",
      concept: ERROR_CONCEPTS.COMPARISON_VS_ASSIGNMENT,
      explanation: "You're using '=' (assignment) where you likely meant '==' (comparison).",
      hints: [
        "Are you trying to check if two things are equal?",
        "In an 'if' statement, use '==' to compare values.",
        "'=' is for setting a variable, '==' is for checking equality.",
        "Mixing up = and == is a common 'vibe coding' mistake.",
        "Conditions always expect a boolean result from a comparison."
      ],
      examples: [
        { wrong: "if x = 5:", right: "if x == 5:" }
      ],
      quickFix: (line) => line.replace('=', '==')
    }
  },
  SEMANTIC_ERRORS: {
    NAME_ERROR: {
      triggers: ["is not defined", "name '.*' is not defined"],
      message: "Variable not defined",
      concept: ERROR_CONCEPTS.VARIABLE_DECLARATION,
      explanation: "You used a variable before assigning it a value.",
      hints: [
        "Have you created this variable yet?",
        "Python needs to know what a name stands for before you use it.",
        "Assign a value first: my_var = 10.",
        "Check for typos in the variable name.",
        "Variables must be defined in the current scope to be accessible."
      ],
      examples: [
        { wrong: "print(x)", right: "x = 5\nprint(x)" }
      ]
    },
    TYPE_ERROR: {
      triggers: ["unsupported operand", "can't multiply sequence", "must be str, not int"],
      message: "Type mismatch in operation",
      concept: ERROR_CONCEPTS.DATA_TYPES,
      explanation: "You're trying an operation on incompatible types.",
      hints: [
        "What kind of data are you working with here?",
        "You can't add a number to a string directly.",
        "Use str() or int() to convert types if needed.",
        "Python is 'strongly typed' and won't guess your intent.",
        "Understanding types prevents runtime crashes."
      ]
    }
  }
};
