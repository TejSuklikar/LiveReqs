const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { callAnthropicWithRetry } = require('../utils/anthropicHelper');

const router = express.Router();

// Define a POST endpoint for generating Mermaid markdown from a use case description
router.post('/', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are an expert at creating Mermaid flowcharts with VERTICAL TOP-DOWN layout.

CRITICAL: Generate a flowchart where nodes are arranged in VERTICAL LEVELS, NOT horizontally in a single line.

**MANDATORY Structure:**
1. graph TD (Top-Down direction)
2. Main flow: Start --> Step1 --> Step2 --> Step3 --> ... --> End
3. Each node connects to the NEXT node in the sequence using -->
4. Alternate flows branch using -.-> and rejoin

**Example of CORRECT VERTICAL structure:**
graph TD
    Start[Begin] --> A[Step 1]
    A --> B[Step 2]
    B --> C[Step 3]
    C --> End([Success])
    
    B -.->|Error| E[Handle error]
    E --> B

**Example of WRONG HORIZONTAL structure (DO NOT DO THIS):**
graph TD
    Start[Begin] A[Step 1] B[Step 2] C[Step 3]

The WRONG example has no arrows connecting nodes - this creates a horizontal layout!

**Your Task:**
Convert the following use case into a Mermaid flowchart following the CORRECT vertical structure.

**Requirements:**
1. Every node in the main flow MUST connect to the next using -->
2. Start with: Start[...] --> FirstStep[...]
3. Continue chain: FirstStep --> SecondStep --> ThirdStep --> etc.
4. End with: LastStep --> End([Success])
5. Add alternate flows with -.-> that branch and rejoin
6. Use {...} for decision points only
7. NO standalone nodes without connections

**Node Types:**
- Rectangle [...] for actions and steps
- Diamond {...} for decisions ONLY
- Ellipse (...) for end states ONLY

**Output Format:**
- Start with: graph TD
- Only Mermaid syntax, NO code fences
- NO comments with %%
- NO explanations

**Input Use Case:**
${useCaseDescription}

**Generate the vertical flowchart now:**`;

  try {
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-opus-4-20250514',
      max_tokens: 4000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    res.json({ completion: msg.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate mermaid markdown' });
  }
});

module.exports = router;