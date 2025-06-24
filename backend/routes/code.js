const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { callAnthropicWithRetry } = require('../utils/anthropicHelper');

const router = express.Router();

// Define a POST endpoint for generating JavaScript code from a Mermaid markdown diagram
router.post('/', async (req, res) => {
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
        system: `Generate the mermaid markdown for the use case that was just created. Also feel
  free to reference the description. Only provide the mermaid markdown, without any additional explanations or comments.
  The mermaid markdown should accurately represent all flows and scenarios described in the use case, including alternate flows. Every single flow should be represented. Even if they aren't
  in the use case description and they are neccesary still add them. Be very thorough. EVERY SINGLE FLOW NEEDS TO BE THERE`,
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
  const prompt =  `Convert the following Mermaid markdown and use case description into JavaScript code for a simulation. The code should use structured if/else or switch/case statements to handle different scenarios, representing all possible flows described in both the Mermaid diagram and the use case description.
  
Guidelines:

Function name and structure:

- Name the function based on the simulation context (e.g., librarySimulation, eCommerceSimulation).
- Use a 'scenario' parameter to control different flows.
- Structure the function with a main flow and branching logic for each decision point.
- Ensure that each branch and decision point directly corresponds to an expected output in the test cases.

Use case integration:

- Carefully read and incorporate all details from the use case description.
- Ensure that any specific scenarios, edge cases, or requirements mentioned in the use case are represented in the code.
- Use the terminology and naming conventions from the use case in your code for consistency.
- Ensure that every possible flow is handled and that there is a corresponding console.log output for each scenario.

Code completeness and clarity:

- Include every flow and decision point from both the Mermaid diagram and use case description.
- Do not use ellipsis (...) or summarizing comments. Show the full code for each branch.
- Represent all possible outcomes, including error cases or unexpected scenarios.
- Ensure that the structure of the code allows for precise and clear matching between test cases and expected outcomes.

Coding style:

- Use clear, consistent indentation throughout.
- Prefer if/else statements for branching logic, using else if for multiple conditions.
- Always include a final 'else' statement to handle unexpected scenarios.
- Use descriptive variable names matching entities in the Mermaid diagram and use case.

Console output:

- Use console.log statements for key actions and decisions at each step.
- Ensure console.log statements accurately reflect the simulation's state and flow.
- Every step of the simulation should produce an output that matches exactly with what is expected in the test cases.

Code simplicity:

- Avoid unnecessary complexity. Do not include random number generation or external libraries.
- Focus on representing the logic flow described in the Mermaid diagram and use case.

Output format:

- Provide only the JavaScript code without any introductory or concluding text.
- Ensure the entire function is visible and not truncated.

Ensure that the generated code adheres to the structure and the guidelines above and is fully aligned with the expected outputs that will be verified through the test cases. Ensure that they way the code is structured, so that when its run on the test cases
it's correctly branching for all the scenarios defined in the test cases. This is crucial. 

Here's what the structure of the code should look like:
function meetingRoomBookingSimulation(scenario) {
  console.log("Start: User initiates meeting room booking process");

  if (scenario === "successful_booking" || scenario === "room_unavailable" || scenario === "modify_time_slot") {
    console.log("User logs in");
    console.log("System authenticates the user");
    console.log("System displays the booking interface");
    console.log("User selects a room and time slot for the meeting");
    console.log("System checks the availability of the selected room and time slot");

    if (scenario === "successful_booking") {
      console.log("System confirms the room is available");
      console.log("System reserves the room for the user");
      console.log("System sends a confirmation email to the user");
      console.log("End - Success: Meeting room booked successfully");
    } else if (scenario === "room_unavailable") {
      console.log("System informs the user that the selected room is not available");
      console.log("System offers alternative rooms or time slots");
      console.log("User selects an alternative room or time slot");
      console.log("System checks the availability of the selected room and time slot");
      console.log("System confirms the room is available");
      console.log("System reserves the room for the user");
      console.log("System sends a confirmation email to the user");
      console.log("End - Success: Meeting room booked successfully with alternative");
    } else if (scenario === "modify_time_slot") {
      console.log("User chooses to modify the time slot");
      console.log("System prompts the user to select a new time slot");
      console.log("User selects a new time slot");
      console.log("System checks the availability of the selected room and time slot");
      console.log("System confirms the room is available");
      console.log("System reserves the room for the user");
      console.log("System sends a confirmation email to the user");
      console.log("End - Success: Meeting room booked successfully with modified time slot");
    }
  } else if (scenario === "login_failure") {
    console.log("User logs in");
    console.log("System displays an error message");
    console.log("System prompts the user to re-enter credentials");
    console.log("User re-enters login credentials");
    console.log("System displays an error message");
    console.log("System prompts the user to contact support");
    console.log("End - Failure: Unable to log in");
  } else if (scenario === "access_restriction") {
    console.log("User logs in");
    console.log("System authenticates the user");
    console.log("System informs the user of access restrictions");
    console.log("System prompts the user to contact support for assistance");
    console.log("End - Failure: User has access restrictions");
  } else if (scenario === "cancel_reservation") {
    console.log("User logs in");
    console.log("System authenticates the user");
    console.log("System displays the booking interface");
    console.log("User selects the option to view current bookings");
    console.log("System displays the user's current bookings");
    console.log("User selects the booking to cancel");
    console.log("System prompts for confirmation of cancellation");
    console.log("User confirms the cancellation");
    console.log("System cancels the reservation");
    console.log("System sends a cancellation confirmation to the user");
    console.log("End - Success: Reservation cancelled successfully");
  } else {
    console.log("Invalid scenario");
    console.log("End - Failure: Unknown scenario");
  }
}
  Make sure to make the indents clear

Use Case Description:
${useCaseDescription}
Mermaid Markdown:
${markdownToUse}`;

  try {
    // Call the Anthropic API to convert the Mermaid markdown to JavaScript code
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-sonnet-4-20250514', // Specify the model to use
      max_tokens: 4096, // Set a higher token limit for generating the full code
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: prompt, // Provide a simple instruction as the content for the user message
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

module.exports = router;