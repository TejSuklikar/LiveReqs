const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const runCodeAndTests = require('./codeExecutor'); // Import the code execution function
console.log(typeof runCodeAndTests); // Should log "function" to confirm that the function is correctly imported

const app = express(); // Initialize the Express application
const PORT = 5001; // Define the port on which the backend server will run

app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS) to allow requests from different origins
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

const MAX_RETRIES = 3; // Define the maximum number of retries for API requests
const RETRY_DELAY = 2000; // Define the delay between retries in milliseconds (2 seconds)

async function callAnthropicWithRetry(anthropic, params, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) { // Loop to attempt the API call up to the maximum number of retries
    try {
      return await anthropic.messages.create(params); // Try to make the API call and return the result if successful
    } catch (error) {
      if (error.status === 529 && attempt < maxRetries) { // Check if the error is due to API overload (HTTP 529) and if there are retries left
        console.log(`API overloaded. Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Wait for the specified delay before retrying
      } else {
        throw error; // If it's a different error or there are no retries left, throw the error
      }
    }
  }
  throw new Error('Max retries reached. API is still overloaded.'); // If the maximum retries are reached without success, throw an error
}

// Define a POST endpoint for generating a detailed use case from a text description
app.post('/api/usecase', async (req, res) => {
  const { description, apiKey } = req.body; // Extract the description and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // Define the prompt to be sent to the Anthropic API, specifying the format for the use case
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
  
  ${description}`; // Append the user's description to the prompt

  try {
    // Call the Anthropic API with retry logic to generate the use case
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
      max_tokens: 1000, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: description, // Provide the user's description as the content for the user message
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

// Define a POST endpoint for generating Mermaid markdown from a use case description
app.post('/api/diagram', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body; // Extract the description, use case description, and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // Define the prompt to be sent to the Anthropic API, requesting the generation of Mermaid markdown
  const prompt = `Generate the mermaid markdown for the use case that was just created. Also feel
  free to reference the description. Only provide the mermaid markdown, without any additional explanations or comments.
  The mermaid markdown should accurately represent all flows and scenarios described in the use case, including alternate flows.

Description: ${description}
Use Case Description: ${useCaseDescription}`; // Include both the description and the detailed use case in the prompt

  try {
    // Call the Anthropic API with retry logic to generate the Mermaid markdown
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
      max_tokens: 2000, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: `Convert the use case to mermaid markdown.`, // Provide a simple instruction as the content for the user message
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

// Define a POST endpoint for generating JavaScript code from a Mermaid markdown diagram
app.post('/api/code', async (req, res) => {
  const { description, useCaseDescription, mermaidMarkdown, apiKey } = req.body; // Extract the description, use case description, Mermaid markdown, and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // If Mermaid markdown is not provided, generate it first
  let markdownToUse = mermaidMarkdown;
  if (!markdownToUse) {
    try {
      // Call the Anthropic API to generate the Mermaid markdown if it's not already provided
      const diagramResponse = await callAnthropicWithRetry(anthropic, {
        model: 'claude-3-5-sonnet-20240620', // Specify the model to use
        max_tokens: 2000, // Limit the number of tokens in the response
        temperature: 0, // Set temperature for deterministic output
        system: `Generate the mermaid markdown for the following use case. Only provide the mermaid markdown, without any additional explanations or comments.`,
        messages: [
          {
            role: 'user',
            content: `Description: ${description}\nUse Case Description: ${useCaseDescription}`, // Provide the description and use case description in the content
          },
        ],
      });
      markdownToUse = diagramResponse.content[0].text; // Use the generated Mermaid markdown
    } catch (error) {
      console.error('Error generating Mermaid markdown:', error);
      return res.status(500).json({ error: 'Failed to generate Mermaid markdown' }); // Return an error response if Mermaid markdown generation fails
    }
  }

  // Define the prompt to convert the Mermaid markdown into JavaScript code
  const prompt = `Convert the following Mermaid markdown into JavaScript code that can be used in a simulation. The generated code should use structured if/else or switch/case statements to handle different scenarios. The goal is to produce a clear and logically structured function that represents all possible flows.

Please adhere to the following guidelines:
- Ensure that the function is named appropriately based on the simulation context (e.g., librarySimulation, eCommerceSimulation).
- Each branch or flow in the Mermaid diagram should be represented by a corresponding if/else or switch/case block in the code.
- The code should be concise and avoid unnecessary complexity. Only include the code necessary to simulate the flows described in the Mermaid diagram.
- Use console.log statements to output key actions and decisions at each step.
- The final output should contain only the JavaScript code—no introductory or concluding text.
- No other additional things like math.random and stuff like that. Simple code so the test cases can run properly.

Make sure to generate the entire full code and ensure it is easy to follow. This is crucial. Don't include the intro or end stuff just the code. Just the code. 
This is an example of what the code should look like. Should be structured like this. MAKE SURE THAT THE INDENTATIONS
ARE CLEAR AND OBVIOUS SO WHEN THE TEST CASES RUN THEY CAN RUN PROPERLY.:
function librarySimulation(scenario) {
  console.log("User enters search criteria");
  console.log("Library System displays matching books");
  console.log("User selects desired book");
  console.log("Library System checks book availability");
  if (scenario === "book_available" || scenario === "user_eligible" || scenario === "no_late_fees" || scenario === "late_fees" || scenario === "user_not_eligible") {
    console.log("Book is available");
    console.log("User requests to borrow");
    console.log("Library System verifies user eligibility");
    if (scenario === "user_eligible" || scenario === "no_late_fees" || scenario === "late_fees") {
      console.log("User is eligible");
      console.log("Library System marks book as borrowed");
      console.log("Library System confirms borrowing");
      console.log("User takes book");
      console.log("Time passes");
      console.log("User returns book");
      console.log("Library System verifies book and checks for fees");
      if (scenario === "no_late_fees") {
        console.log("No late fees");
        console.log("Library System marks book as returned");
        console.log("Library System confirms return");
      } else if (scenario === "late_fees") {
        console.log("Late fees applied");
        console.log("Library System informs of late fees");
        console.log("User pays late fees");
        console.log("Library System marks book as returned");
        console.log("Library System confirms return");
      }
    } else if (scenario === "user_not_eligible") {
      console.log("User is not eligible");
      console.log("Library System informs of ineligibility");
    }
  } else if (scenario === "book_unavailable" || scenario === "user_requests_hold") {
    console.log("Book is not available");
    console.log("Library System informs book unavailable");
    console.log("Library System offers to place hold");
    if (scenario === "user_requests_hold") {
      console.log("User agrees to hold");
      console.log("User requests hold");
      console.log("Library System places hold on book");
      console.log("Library System confirms hold placement");
    }
  } else {
    console.log("Invalid scenario");
  }
} MAKE SURE THE CODE HAS ZERO ERRORS AND IS EASY TO FOLLOW. MAKE SURE THE INDENTATIONS ARE CLEAR AND OBVIOUS SO WHEN THE TEST CASES RUN THEY CAN RUN PROPERLY.
Mermaid Markdown:
${markdownToUse}`;

  try {
    // Call the Anthropic API to convert the Mermaid markdown to JavaScript code
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
      max_tokens: 4000, // Set a higher token limit for generating the full code
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: `Convert the mermaid markdown to JavaScript code.`, // Provide a simple instruction as the content for the user message
        },
      ],
    });

    // Respond with the generated JavaScript code
    res.json({ completion: msg.content[0].text });
  } catch (error) {
    // Log and respond with an error if the API call fails
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// Define a POST endpoint for generating test cases based on the provided use case description and simulation code
app.post('/api/testcases', async (req, res) => {
  const { useCaseDescription, code, apiKey } = req.body; // Extract the use case description, simulation code, and API key from the request body
  const anthropic = new Anthropic({ apiKey }); // Initialize the Anthropic API client with the provided API key

  // Define the prompt for generating test cases
  const prompt = `Given the following use case description and simulation code, create a set of test cases that cover all possible flows, including the basic flow and all alternate flows. Analyze the use case and code structure to create appropriate test cases.

Use Case Description:
${useCaseDescription}

Simulation Code:
${code}

Generate as many test cases as possible that cover all the possible flows described in the use case description and code. in the following format:

// Test case for scenario name
function testCaseN() {
  eCommerceSimulation("scenario_name");
}
const expectedOutputN = [
  "Expected output line 1",
  "Expected output line 2",
  // ...
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
- Make sure that the expected output is exactly the same words and capitalization as the console.log statements in the code.
The code will be formatted like this so make sure these test cases when created perfectly match this structure
function simulationFunction(scenario) {
  console.log("Starting simulation");
  switch (scenario) {
    case "scenario_1":
      console.log("Action 1");
      console.log("Action 2");
      console.log("End of scenario 1");
      break;
    case "scenario_2":
      console.log("Action 3");
      console.log("Action 4");
      console.log("End of scenario 2");
      break;
    case "scenario_3":
      console.log("Action 5");
      console.log("Action 6");
      console.log("End of scenario 3");
      break;
    default:
      console.log("Invalid scenario");
      break;
  }
}`;

  try {
    // Call the Anthropic API to generate the test cases
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
      max_tokens: 2000, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: `Generate test cases for the given use case and simulation code.`, // Provide a simple instruction as the content for the user message
        },
      ],
    });

    // Respond with the generated test cases
    res.json({ completion: msg.content[0].text });
  } catch (error) {
    // Log and respond with an error if the API call fails
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate test cases' });
  }
});


// Define a POST endpoint for running test cases
app.post('/api/runtests', (req, res) => {
  // Extract the 'code' and 'testCases' from the request body
  const { code, testCases } = req.body;

  // Log the received request body for debugging purposes
  console.log('Received request body:', JSON.stringify(req.body, null, 2));

  try {
    // Run the provided code with the test cases
    const results = runCodeAndTests(code, testCases);
    
    // Send back the test results as a JSON response
    res.json({ results });
  } catch (error) {
    // Log any errors that occur during the execution of the tests
    console.error('Error running tests:', error);
    
    // Send back an error response with the details of the error
    res.status(500).json({ error: 'Failed to run tests', details: error.message });
  }
});

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
