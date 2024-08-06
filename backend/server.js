const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const runCodeAndTests = require('./codeExecutor'); // Import the code execution function

const app = express();
const PORT = 5001; // Backend server port

app.use(cors());
app.use(bodyParser.json());

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
    const msg = await anthropic.messages.create({
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

app.post('/api/code', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Create a JavaScript simulation based on the Use Case Description and Description. The simulation should be designed to handle a wide range of scenarios and be easily adaptable to different contexts. Structure the code for easy editing. Here are the key components to include:

1. A main class named Simulation that represents the core functionality of the described process flow.
2. Methods within the class to simulate various actions as described in the use case.
3. A flexible system for tracking related items or requirements based on user interactions.

Ensure that the code:
- Considers general constraints that could apply to various scenarios.
- Structures the code in a clear, readable manner, using appropriate comments to explain complex logic.

Here is the format:

class Simulation {
  // Core functionality methods
}

// Example usage
const simulation = new Simulation();
// Call methods on the simulation instance as described in the use case

Make sure to generate the entire full code and ensure it is easy to follow. This is crucial. Do not include introductory or concluding statements. Only provide the code. And with the code
don't show example executions and stuff like that. Just the functionality methods and class. 

Description: ${description}
Use Case Description: ${useCaseDescription}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
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
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

app.post('/api/testcases', async (req, res) => {
  const { description, code, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Based on the description and code, create a comprehensive set of test cases both edge cases and regular cases that test all possible kinds of inputs and make sure these cases ensure a correct output. It is very important that the expected output aligns with the output from the test case input. Specify specific input values and expected output values.

Include the test cases and make sure they are numbered, very descriptive, and easy to understand. Provide both an English explanation and the corresponding JavaScript code for each test case. Ensure that each test case is valid JavaScript code and can be run without syntax errors. If there are test cases that are generated that aren't present in the use case description, like there's a test case and there's no alternate flow to run it, make sure to also update the use case description and add that alternate flow. Make sure it is a logical flow. Do not include introductory or concluding statements. Ensure the test cases can be simulated in the code.

Here is the codeExecutor code. The code you generate must be able to be run in this codeExecutor. If it is not able to be run in this codeExecutor, it will be rejected.

\`\`\`javascript
const { VM } = require('vm2');

const runCodeAndTests = (code, testCases) => {
  const vm = new VM({
    timeout: 2000,
    sandbox: {},
  });

  let results = '';

  try {
    // Run the provided code
    vm.run(code);

    // Evaluate the test cases
    const testCaseResults = testCases.map((testCase, index) => {
      try {
        const result = vm.run(testCase.code);
        return \`Test Case \${index + 1}: Passed\`;
      } catch (error) {
        return \`Test Case \${index + 1}: Failed - \${error.message}\`;
      }
    });

    results = testCaseResults.join('\n');
  } catch (error) {
    results = \`Error executing code: \${error.message}\`;
  }

  return results;
};

module.exports = runCodeAndTests;
\`\`\`

Make sure the test cases are written in the following format:

\`\`\`javascript
// Test Case 1: Description of the test case in English
(function() {
  // Code for test case 1
})();

// Test Case 2: Description of the test case in English
(function() {
  // Code for test case 2
})();
\`\`\`

Here is the code:
${code}`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      temperature: 0,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: `${description}\n\n${code}`,
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

  const testCaseList = testCases.split('\n\n').map(testCase => {
    return { code: testCase };
  });

  // Log the test cases for debugging purposes
  console.log('Test Cases:', testCaseList);

  const results = runCodeAndTests(code, testCaseList);

  res.json({ completion: results });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
