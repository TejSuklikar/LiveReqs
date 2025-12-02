const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { callAnthropicWithRetry } = require('../utils/anthropicHelper');

const router = express.Router();

// Define a POST endpoint for generating a detailed use case from a text description
router.post('/', async (req, res) => {
  const { description, apiKey } = req.body; // Extract the description and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // Define the prompt to be sent to the Anthropic API, specifying the format for the use case
  const prompt = `You are a product management expert specializing in use case documentation.

Convert the following description into a comprehensive, well-structured use case following this exact format:

**Use Case: [Descriptive Title]**

**Pre-conditions:**
[What must be true before this use case can execute]

**Success Criteria:**
[How we know the system succeeded]

**Triggers:**
[What external event initiates this use case]

**Actors:**
[List all people, roles, and systems involved. The system being built is always an actor.]

**Description:**
[Brief overview of the goal and how it's achieved]

**Basic Flow:**
1. [Actor] performs [action]
2. [System/Actor] responds with [action]
3. [Continue numbered steps...]
...
N. Use Case ends in Success

**Alternate Flows:**

IMPORTANT: Alternate flows must be numbered sequentially starting from step 2.
- If step 2 has alternate flows, label them 2A, 2B, 2C, etc.
- If step 3 has alternate flows, label them 3A, 3B, 3C, etc.
- Continue this pattern for all steps that have alternate flows
- Do NOT skip numbers (e.g., don't go from 2A to 4A)

Format:
[Step Number][Letter]. [Condition that triggers this alternate flow]:
   1. [Actor] performs [action]
   2. [System/Actor] responds [action]
   3. Use Case continues from Step [M] OR Use Case ends in [Success/Failure]

Example:
2A. User authentication fails:
   1. System displays error message
   2. System prompts user to retry
   3. Use Case continues from Step 2

2B. User account is locked:
   1. System displays locked account message
   2. System sends unlock email to user
   3. Use Case ends in Failure

3A. Payment processing fails:
   1. System logs payment error
   2. System offers alternative payment methods
   3. Use Case continues from Step 3

**Critical Requirements:**
- Create alternate flows for every realistic exception, error, or branching scenario
- Number alternate flows sequentially by step (2A, 2B, 3A, 3B, 4A, etc.)
- Ensure alternate flows reference the correct step numbers from the Basic Flow
- Make the flow logical and realistic (not just efficient)
- Each step should be atomic and clearly describe a single action or decision
- Use consistent, clear language that can be easily visualized in a flowchart
- If the description is code, explain the code's behavior in use case format
- If the description is invalid or nonsensical, respond with exactly: "Not a valid text description"

**Description to convert:**
${description}`;

  try {
    // Call the Anthropic API with retry logic to generate the use case
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-opus-4-20250514', // Specify the model to use
      max_tokens: 2500, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      messages: [
        {
          role: 'user',
          content: prompt, // Provide the prompt as the content for the user message
        },
      ],
    });

    // Respond with the generated use case
    res.json({ completion: msg.content[0].text });
  } catch (error) {
    // Log and respond with an error if the API call fails
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate use case' });
  }
});

module.exports = router;