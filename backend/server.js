const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = 5001; // Backend server port

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());

app.post('/api/usecase', async (req, res) => {
  const description = req.body.description;
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

app.post('/api/testcases', async (req, res) => {
  const description = req.body.description;
  const prompt = `Based on the description, create a comprehensive set of test cases both edge cases and regular cases that test all possible kinds of inputs and make sure these cases ensure a correct output. It is very important that the expected output aligns with the output from the test case input. Specify specific input values and expected output values.
  just include the test cases and make sure they are numbered and very descriptive and understanding. Also if there are test cases that are generated that aren't present
  in the use case description, like theres a test case and theres no alternate flow to run it, make sure to also update
  the use case description and add that alternate flow. Make sure it is a logical flow. Dont have the intro and outro stuff of the responses. Have the title be Test Cases at the top of the box. Inside
  of it tho. 

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

    const completionText = msg.content[0].text;
    const newAlternateFlows = extractNewAlternateFlows(completionText);

    res.json({ completion: completionText, newAlternateFlows });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({ error: 'Failed to generate test cases' });
  }
});

const extractNewAlternateFlows = (text) => {
  const newFlows = [];
  const regex = /New Alternate Flow:\n(.*?)(?=\n\n|$)/gs;
  let match;
  while ((match = regex.exec(text)) !== null) {
    newFlows.push(match[1].trim());
  }
  return newFlows;
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
