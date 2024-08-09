const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const runCodeAndTests = require('./codeExecutor'); // Import the code execution function

const app = express();
const PORT = 5001; // Backend server port

app.use(cors());
app.use(bodyParser.json());

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function callAnthropicWithRetry(anthropic, params, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await anthropic.messages.create(params);
    } catch (error) {
      if (error.status === 529 && attempt < maxRetries) {
        console.log(`API overloaded. Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached. API is still overloaded.');
}

app.post('/api/usecase', async (req, res) => {
  const { description, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Convert the text description to a detailed use case using the format provided. 
  Pre-conditions: What has happened before the System is ready to achieve the desired goal
  Success Criteria: How will we know that the system has succeeded in achieving the goal
  Triggers: What external event triggers this Use case
  Actors: The people/roles and (external) systems involved in achieving the goal. The System being built is always one of the Actors.
  Description: What is the goal of the system? A brief description of how that goal is achieved.

  Basic Flow
  Actor performs action  
  System/Actor responds with some action
  Actor performs action 
  System/Actor responds with some action
  .
  .
  .
  .
  Use Case ends in Success

  Alternate Flows
  <Basic Flow Step Number N>A. Condition that triggers this flow:
  Actor performs action
  System/Actor responds with some action
  Actor performs action
  Use Case continues from Step M OR Use Case ends in Success/Failure
  <Basic Flow Step Number>B. Condition that triggers this flow:
  Actor performs action
  System/Actor responds with some action
  Actor performs action
  Use Case continues from Step M OR Use Case ends in Success/Failure

  Make sure it follows exactly this format. You can make reasonable assumptions where it seems fit to do but make sure to ask the user if everything looks good before proceeding as the user may need to tweak assumptions. And make sure all possible alternate flows are created. Every single kind of alternate flow should be there. Also make sure for alternate flows that it branches off from correct steps as it can be costly if incorrect. And make sure that every flow is logical and makes sense. Don't just go based off efficiency necessarily, make sure it has logical and realistic flow. Only 
  provide the use case stuff. The beginning where you describe what the format is or whatever and the end where you ask if everything looks good should not be included. So nothing
  like this: Based on the provided description, I've created a detailed use case. Please review it and let me know if any adjustments are needed. And nothing like this: Does this use case accurately represent the scenario you described? Are there any assumptions or details you'd like to modify or add? Also these must be actual scenarios and must be able to turn into a use case. Must be logical and make sense. Code and diagrams are valid. If it doesn't make sense or is not logical, it will be rejected. Say "Not a valid text description". If it is code that is valid and you should do the same
  thing and just explain the code in english in the same template. 
  
  ${description}`;

  try {
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      temperature: 0,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: description,
        },
      ],
    });

    res.json({ completion: msg.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate use case' });
  }
});

app.post('/api/diagram', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Generate the mermaid markdown for the use case that was just created. Also feel
  free to reference the description. Only provide the mermaid markdown, without any additional explanations or comments.
  The mermaid markdown should accurately represent all flows and scenarios described in the use case, including alternate flows.

Description: ${description}
Use Case Description: ${useCaseDescription}`;

  try {
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      temperature: 0,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: `Convert the use case to mermaid markdown.`,
        },
      ],
    });

    res.json({ completion: msg.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate mermaid markdown' });
  }
});

app.post('/api/code', async (req, res) => {
  const { description, useCaseDescription, mermaidMarkdown, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  // If mermaidMarkdown is not provided, we'll need to generate it first
  let markdownToUse = mermaidMarkdown;
  if (!markdownToUse) {
    try {
      const diagramResponse = await callAnthropicWithRetry(anthropic, {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        temperature: 0,
        system: `Generate the mermaid markdown for the following use case. Only provide the mermaid markdown, without any additional explanations or comments.`,
        messages: [
          {
            role: 'user',
            content: `Description: ${description}\nUse Case Description: ${useCaseDescription}`,
          },
        ],
      });
      markdownToUse = diagramResponse.content[0].text;
    } catch (error) {
      console.error('Error generating Mermaid markdown:', error);
      return res.status(500).json({ error: 'Failed to generate Mermaid markdown' });
    }
  }

  const prompt = `Convert the following mermaid markdown to JavaScript code that can be run in a 
  simulation. When test cases are created in later steps they need to be able to be run in this code. Only provide
  the necessary code for running the simulation. Also don't have an intro or beginning stuff just the code. The code
  should be structured as if/else statements or switch/case so it clearly shows all the possible flows. Should be like one main
  function then if/else or switch/case statements. This easily represents all the possible flows. 
  ENSURE THERE ARE NO SYNTAX OR LOGIC OR ANY KIND OF ERROR

Make sure to generate the entire full code and ensure it is easy to follow. This is crucial. Don't include the intro or end stuff just the code. Just the code. 
This is an example of what the code should look like. Should be structured like this.:
function cricketSimulation(scenario) {
  console.log("Starting cricket simulation");
  switch (scenario) {
    case "hit":
      console.log("Bowler delivers the ball");
      console.log("Batter hits the ball");
      console.log("End of delivery");
      break;
    case "leave_miss":
      console.log("Bowler delivers the ball");
      console.log("Batter leaves the ball");
      console.log("Ball misses stumps");
      console.log("End of delivery");
      break;
    case "leave_out":
      console.log("Bowler delivers the ball");
      console.log("Batter leaves the ball");
      console.log("Ball hits stumps");
      console.log("Batter out");
      console.log("End of delivery");
      break;
    case "lbw_out":
      console.log("Bowler delivers the ball");
      console.log("Ball strikes batter's pad");
      console.log("Umpire gives LBW");
      console.log("Batter out");
      console.log("End of delivery");
      break;
    case "lbw_not_out":
      console.log("Bowler delivers the ball");
      console.log("Ball strikes batter's pad");
      console.log("Umpire denies LBW");
      console.log("End of delivery");
      break;
    case "wide":
      console.log("Bowler delivers the ball");
      console.log("Ball is too wide");
      console.log("Umpire calls wide");
      console.log("Extra run added");
      console.log("End of delivery");
      break;
    default:
      console.log("Invalid scenario");
      break;
  }
}

Mermaid Markdown:
${markdownToUse}`;

  try {
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      temperature: 0,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: `Convert the mermaid markdown to JavaScript code.`,
        },
      ],
    });

    res.json({ completion: msg.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

app.post('/api/testcases', async (req, res) => {
  const { useCaseDescription, code, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Given the following use case description and simulation code, create a set of test cases that cover all possible flows, including the basic flow and all alternate flows. Analyze the use case and code structure to create appropriate test cases.

Use Case Description:
${useCaseDescription}

Simulation Code:
${code}

Generate as many test cases as possible that cover all the possible flows described in the use case description and code. in the following format:

// Test case for successful purchase
function testCase1() {
  eCommerceSimulation("successful_purchase");
}
const expectedOutput1 = [
  "Starting e-commerce simulation",
  "User accesses website",
  "System displays product catalog",
  "User browses catalog",
  "User selects items",
  "System adds items to cart",
  "User proceeds to checkout",
  "System requests shipping information",
  "User enters shipping information",
  "System presents payment methods",
  "User selects payment method",
  "User confirms purchase",
  "System processes payment with Payment Gateway",
  "Payment successful",
  "System sends confirmation email to user",
  "System processes order with Warehouse",
  "Warehouse packs and prepares items",
  "Shipping Service provides tracking number",
  "System sends tracking number to user",
  "User tracks shipment",
  "Shipping Service delivers package"
];

// Test case for payment failure
function testCase2() {
  eCommerceSimulation("payment_failure");
}
const expectedOutput2 = [
  "Starting e-commerce simulation",
  "User accesses website",
  "System displays product catalog",
  "User browses catalog",
  "User selects items",
  "System adds items to cart",
  "User proceeds to checkout",
  "System requests shipping information",
  "User enters shipping information",
  "System presents payment methods",
  "User selects payment method",
  "User confirms purchase",
  "System processes payment with Payment Gateway",
  "Payment failed",
  "System informs user about payment failure",
  "User tries another payment method or cancels"
];

// Continue this pattern for the rest of the test cases...
Ensure that your test cases cover:
1. The basic flow described in the use case
2. All alternate flows mentioned in the use case
3. Edge cases and error scenarios that can be inferred from the use case and code

IMPORTANT: 
- The expected outputs must exactly match the console.log statements in the provided code, including punctuation and capitalization. 
- Each test case should start with a brief, one-line description comment explaining what it's testing.
- Do not include any additional explanations or comments outside of the function definitions and the initial description comment.
- Adapt your test cases to the specific structure and logic of the provided code and use case.
- Each test case should be designed to test a specific flow through the simulation as described in the use case.
- These cases basically need to be different choices taken at different switch cases or if/else
- Make sure that the expected output is exactly the same words and capitilization as the console.log statements in the code.`;

  try {
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      temperature: 0,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: `Generate test cases for the given use case and simulation code.`,
        },
      ],
    });

    res.json({ completion: msg.content[0].text });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate test cases' });
  }
});

app.post('/api/runtests', (req, res) => {
  const { code, testCases } = req.body;

  console.log('Received code:', code);
  console.log('Received test cases:', testCases);

  try {
    const results = runCodeAndTests(code, testCases);
    console.log('Test results:', results); // Add this line for debugging
    res.json({ completion: results });
  } catch (error) {
    console.error('Error running tests:', error);
    res.status(500).json({ error: 'Failed to run tests', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
