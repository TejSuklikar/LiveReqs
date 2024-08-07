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

app.post('/api/diagram', async (req, res) => {
  const { description, useCaseDescription, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Generate the mermaid markdown for the use case that was just created. Also feel
  free to reference the description. Only provide the mermaid markdown, without any additional explanations or comments.
  The mermaid markdown should accurately represent all flows and scenarios described in the use case, including alternate flows.

Description: ${description}
Use Case Description: ${useCaseDescription}`;

  try {
    const msg = await anthropic.messages.create({
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
      const diagramResponse = await anthropic.messages.create({
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
  should be structured as if/else statements or switch/case so it clearly shows all the possible flows. 

Make sure to generate the entire full code and ensure it is easy to follow. This is crucial. Don't include the intro or end stuff just the code.

Mermaid Markdown:
${markdownToUse}`;

  try {
    const msg = await anthropic.messages.create({
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
  const { description, code, apiKey } = req.body;
  const anthropic = new Anthropic({ apiKey });

  const prompt = `Based on the description and code, create a comprehensive set of test cases both edge cases and regular cases that test all possible kinds of inputs and make sure these cases ensure a correct output. It is very important that the expected output aligns with the output from the test case input. Specify specific input values and expected output values.

Include the test cases and make sure they are numbered, very descriptive, and easy to understand. Provide both an English explanation and the corresponding JavaScript code for each test case. Ensure that each test case is valid JavaScript code and can be run without syntax errors. If there are test cases that are generated that aren't present in the use case description, like there's a test case and there's no alternate flow to run it, make sure to also update the use case description and add that alternate flow. Make sure it is a logical flow. Do not include introductory or concluding statements. Ensure the test cases can be simulated in the code.
Here is the codeExecutor code. The code you generate must be able to be run in this codeExecutor. If it is not able to be run in this codeExecutor, it will be rejected. Basically each test case needs to be an option in the if else statements
that were created in the code. They need to follow some flow. THey need to be easily runnable based on the code that was created. So make sure that is done, probably the 
most important part. 

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
