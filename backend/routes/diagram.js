const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { callAnthropicWithRetry } = require('../utils/anthropicHelper');

const router = express.Router();

// Define a POST endpoint for generating Mermaid markdown from a use case description
router.post('/', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body; // Extract the description, use case description, and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // Define the prompt to be sent to the Anthropic API, requesting the generation of Mermaid markdown
  const prompt = `You are an expert at analyzing use cases and creating structured flowchart representations.

Analyze the provided use case and generate a detailed, structured flowchart specification that captures ALL flows and scenarios.

**Your Task:**
Create a comprehensive flowchart structure that represents:
1. The complete Basic Flow as the main path
2. Every alternate flow as branching paths (in sequential order: 2A, 2B, 3A, 3B, etc.)
3. All decision points where the flow can diverge
4. All possible end states (Success, Failure, Partial Success, etc.)

**Flowchart Structure Requirements:**

1. **Nodes (Steps):**
   - Each step in the Basic Flow should be a distinct node
   - Each alternate flow should have its own nodes
   - Decision points should be clearly identified
   - Start and end states should be explicit

2. **Connections (Flow):**
   - Show the sequence of steps in the Basic Flow
   - Show how alternate flows branch off from specific steps IN ORDER (2A, 2B, then 3A, 3B, etc.)
   - Show where alternate flows rejoin the Basic Flow or reach their own end states
   - Label decision branches clearly (e.g., "If successful", "If error occurs")

3. **Node Types:**
   - Start: The beginning of the use case
   - Action: A step where an actor or system performs an action
   - Decision: A point where the flow branches based on a condition
   - End: A terminal state (Success, Failure, etc.)

4. **Flow Labels:**
   - Main path: Primary sequence through Basic Flow
   - Alternate flows: Labeled with their identifier in sequential order (2A, 2B, 3A, 3B, 4A, etc.)
   - Decision branches: Labeled with the condition (Yes/No, Success/Failure, etc.)

**Output Format:**
Generate a Mermaid flowchart using graph TD (top-down) syntax that clearly represents this structure.

**Requirements:**
- Use solid arrows (-->) for the main Basic Flow
- Use dotted arrows (-.->)  for alternate flows branching off
- Use decision nodes {...} for any branching points
- Use rectangular nodes [...] for actions
- Label all branches with clear conditions
- Organize alternate flows sequentially (all step 2 alternates together, then all step 3 alternates, etc.)
- Do NOT include markdown code fences (\`\`\`mermaid)
- Do NOT include comments starting with %%
- Make node labels concise but descriptive (max 60 characters)
- Ensure every alternate flow path is complete (shows where it goes)

**Example Pattern:**
\`\`\`
graph TD
    Start[Start: Use Case Initiated] --> Step1[User performs action]
    Step1 --> Step2[System validates input]
    Step2 --> Decision1{Input valid?}
    Decision1 -->|Yes| Step3[System processes request]
    Step3 --> End1[End: Success]

    Decision1 -.->|No: 2A| Alt2A1[System displays error]
    Alt2A1 --> Alt2A2[User corrects input]
    Alt2A2 --> Step2

    Step2 -.->|2B: Timeout| Alt2B1[System logs timeout]
    Alt2B1 --> End2[End: Failure]

    Step3 -.->|3A: Processing Error| Alt3A1[System retries operation]
    Alt3A1 --> Step3
\`\`\`

**Inputs:**

Description: ${description}

Use Case: ${useCaseDescription}

Generate the complete Mermaid flowchart now (output ONLY the flowchart syntax, no explanations):`; // Include both the description and the detailed use case in the prompt

  try {
    // Call the Anthropic API with retry logic to generate the Mermaid markdown
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-opus-4-20250514', // Specify the model to use
      max_tokens: 4000, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      messages: [
        {
          role: 'user',
          content: prompt, // Provide a simple instruction as the content for the user message
        },
      ],
    });

    // Respond with the generated Mermaid markdown
    res.json({ completion: msg.content[0].text });
  } catch (error) {
    // Log and respond with an error if the API call fails
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate mermaid markdown' });
  }
});

module.exports = router;