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
  thing and just explain the code in english in the same template. Make as many alternate flows as possible. Be very thorough. 
  
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
  The mermaid markdown should accurately represent all flows and scenarios described in the use case, including alternate flows. Every single flow should be represented. Even if they aren't
  in the use case description and they are neccesary still add them. Be very thorough. 
  Lets say this was the description: A customer contacts support through various channels (phone, email, chat). The issue is logged, and initial troubleshooting is provided. If unresolved, it's escalated to a specialist. The specialist diagnoses and provides a solution. The customer is informed and asked to confirm the resolution. If resolved, the case is closed; if not, it returns for further troubleshooting. The customer can provide feedback on the support experience, which is reviewed for service improvement.
  And this was the Use Case Description: 
  Use Case: 
Pre-conditions:

Customer support system is operational
Support agents are available
Customer has an account in the system
Knowledge base is up-to-date

Success Criteria:

Customer's issue is resolved
Support case is closed
Customer provides positive feedback
Resolution is documented for future reference

Triggers:

Customer initiates contact with support through phone, email, chat, or self-service portal

Actors:

Customer
Initial Support Agent
Specialist Support Agent
Support System
Knowledge Base System
Feedback System

Description:
The goal of the system is to efficiently resolve customer issues through a structured support process, utilizing various channels and levels of expertise while maintaining customer satisfaction and improving service quality.
Basic Flow:

Customer contacts support through chosen channel
System logs the support request and assigns a unique case ID
System assigns case to an available Initial Support Agent
Initial Support Agent reviews the issue and customer history
Initial Support Agent provides initial troubleshooting based on knowledge base
Customer attempts the suggested solution
Initial Support Agent asks if the issue is resolved
Customer confirms issue resolution
System prompts customer for feedback
Customer provides feedback
System logs feedback and resolution details
System closes the case
Use Case ends in Success

Alternate Flows:
3A. Customer uses self-service portal:

System presents relevant knowledge base articles
Customer follows self-help instructions
System prompts customer if issue is resolved
If resolved, continue from Step 9 of Basic Flow
If unresolved, continue from Step 3 of Basic Flow

5A. Initial Support Agent cannot find relevant solution in knowledge base:

Agent informs customer that additional research is needed
Agent puts customer on hold or promises a callback
Agent consults with colleagues or performs additional research
Use Case continues from Step 5 of Basic Flow

7A. Customer indicates issue is not resolved:

Initial Support Agent attempts additional troubleshooting
If still unresolved, Agent escalates the issue to a Specialist Support Agent
Specialist Support Agent reviews the case
Specialist Support Agent diagnoses the issue and provides a solution
Customer attempts the suggested solution
Specialist Support Agent asks if the issue is resolved
If resolved, continue from Step 8 of Basic Flow
If unresolved, return to step 3 of this flow

7B. Customer requests escalation:

Initial Support Agent escalates the issue to a Specialist Support Agent
Use Case continues from Step 3 of Alternate Flow 7A

8A. Customer indicates issue is not resolved after specialist intervention:

Specialist Support Agent informs customer that further investigation is needed
Agent schedules a follow-up appointment or promises to call back
Agent consults with additional specialists or product development team
Use Case continues from Step 3 of Alternate Flow 7A

10A. Customer declines to provide feedback:

System logs that feedback was declined
Use Case ends in Success

10B. Customer provides negative feedback:

System flags the case for review
Support manager is notified
Support manager reviews the case and contacts the customer for additional information
Support manager takes necessary actions to address the concerns
Use Case ends in Success with follow-up actions

Additional Alternate Flows:
1A. System experiences technical issues:

Customer is informed of technical difficulties
System logs the failed attempt
Customer is provided alternative contact methods
Use Case ends in Failure

2A. High volume of requests:

System estimates wait time and informs customer
Customer chooses to wait or request a callback
If callback requested, system schedules callback and notifies available agent
Use Case continues from Step 3 of Basic Flow or ends if customer abandons

5B. Issue requires on-site support:

Agent informs customer that on-site support is necessary
Agent schedules on-site visit
On-site support is conducted
Use Case continues from Step 7 of Basic Flow

8B. Customer is dissatisfied with resolution:

Agent offers alternative solutions or escalation
If customer accepts, return to Step 5 of Basic Flow or Step 2 of Alternate Flow 7A
If customer declines, agent offers compensation or alternative resolution
Use Case ends in Partial Success

11A. Resolution reveals systemic issue:

System flags the case for product/service improvement
Product team is notified for potential updates
Use Case continues from Step 12 of Basic Flow
This is what the Mermaid should look like.Look how thorough it is, thats how thorough every single one should be.
graph TD
    %% Basic Flow
    A[Start] --> B[1. Customer contacts support]
    B --> C[2. System logs request and assigns case ID]
    C --> D[3. System assigns case to Initial Support Agent]
    D --> E[4. Agent reviews issue and customer history]
    E --> F[5. Agent provides initial troubleshooting]
    F --> G[6. Customer attempts solution]
    G --> H[7. Agent asks if issue is resolved]
    H --> I[8. Customer confirms resolution]
    I --> J[9. System prompts for feedback]
    J --> K[10. Customer provides feedback]
    K --> L[11. System logs feedback and resolution]
    L --> M[12. System closes the case]
    M --> N[End - Success]

    %% Alternate Flows 
    %% 1A
    B -.-> |1A| AA[Customer informed of technical difficulties]
    AA --> AB[System logs failed attempt]
    AB --> AC[Customer provided alternative contact methods]
    AC --> AD[End - Failure]

    %% 2A
    C -.-> |2A| BA[System estimates wait time]
    BA --> BB{Customer choice}
    BB -->|Wait| D
    BB -->|Callback| BC[System schedules callback]
    BC --> BD[Agent notified]
    BD --> D
    BB -->|Abandon| BE[End - Customer Abandoned]

    %% 3A
    C -.-> |3A| CA[System presents knowledge base articles]
    CA --> CB[Customer follows self-help instructions]
    CB --> CC{Issue resolved?}
    CC -->|Yes| J
    CC -->|No| D

    %% 5A
    E -.-> |5A| DA[Agent informs customer research needed]
    DA --> DB[Agent puts customer on hold/promises callback]
    DB --> DC[Agent consults colleagues/researches]
    DC --> F

    %% 5B
    E -.-> |5B| EA[Agent informs on-site support needed]
    EA --> EB[Agent schedules on-site visit]
    EB --> EC[On-site support conducted]
    EC --> H

    %% 7A and 7B
    H -.-> |7A/7B| FA[Agent attempts additional troubleshooting/Customer requests escalation]
    FA --> FB{Resolved?}
    FB -->|No| FC[Agent escalates to Specialist]
    FC --> FD[Specialist reviews case]
    FD --> FE[Specialist diagnoses and provides solution]
    FE --> FF[Customer attempts solution]
    FF --> FG{Resolved?}
    FG -->|Yes| I
    FG -->|No| FD

    %% 8A
    I -.-> |8A| HA[Specialist informs further investigation needed]
    HA --> HB[Agent schedules follow-up]
    HB --> HC[Agent consults additional specialists]
    HC --> FD

    %% 8B
    I -.-> |8B| IA{Customer dissatisfied}
    IA -->|Accept alternatives| IB[Agent offers alternative solutions]
    IB --> F
    IA -->|Decline alternatives| IC[Agent offers compensation]
    IC --> ID[End - Partial Success]

    %% 10A
    K -.-> |10A| JA[System logs feedback declined]
    JA --> M

    %% 10B
    K -.-> |10B| KA[System flags case for review]
    KA --> KB[Support manager notified]
    KB --> KC[Manager reviews and contacts customer]
    KC --> KD[Manager takes action]
    KD --> KE[End - Success with follow-up]

    %% 11A
    L -.-> |11A| LA[System flags for product improvement]
    LA --> LB[Product team notified]
    LB --> M
Dont put the %% in ur responses. Keep it in normal mermaid markdown syntax.
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
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
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

Generate at least 20 cases that cover all the possible flows described in the use case description and code. Each test case should:

1. Cover a specific flow or scenario represented in the code.
2. Have an expected output that exactly matches the console.log statements in the provided code, including punctuation and capitalization.
3. Avoid introducing any scenarios or outcomes not present in the provided code.
4. Be structured to trigger each branch in the code at least once across the test cases.
5. Ensure that the expected outputs match the code exactly—no additional text or differences in wording.

Each test case should start with a brief, one-line description comment explaining what it's testing. The expected output should be an array of strings that matches the console.log output for that scenario.

IMPORTANT:
- Ensure that every test case directly corresponds to a flow or decision point in the provided code.
- The expected outputs must exactly match the console.log statements in the provided code, including punctuation and capitalization.
- The test cases should not introduce or test scenarios that aren't present in the code.
- Ensure that the expected outputs are correct and align perfectly with the logic of the code.

Example structure of a test case:

Dont have the "here are 20 cases" stuff. Just the cases. Below is the example code that was generated and the cases that were created. Look at how 
the cases follow exactly the code and different paths the code takes. This should be the standard for every single time test cases
are created. 

Code: 
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

// Test case for successful booking
function testCase1() {
  meetingRoomBookingSimulation("successful_booking");
}
const expectedOutput1 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully"
];

// Test case for room unavailable
function testCase2() {
  meetingRoomBookingSimulation("room_unavailable");
}
const expectedOutput2 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "System informs the user that the selected room is not available",
  "System offers alternative rooms or time slots",
  "User selects an alternative room or time slot",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully with alternative"
];

// Test case for modifying time slot
function testCase3() {
  meetingRoomBookingSimulation("modify_time_slot");
}
const expectedOutput3 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "User chooses to modify the time slot",
  "System prompts the user to select a new time slot",
  "User selects a new time slot",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully with modified time slot"
];

// Test case for login failure
function testCase4() {
  meetingRoomBookingSimulation("login_failure");
}
const expectedOutput4 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System displays an error message",
  "System prompts the user to re-enter credentials",
  "User re-enters login credentials",
  "System displays an error message",
  "System prompts the user to contact support",
  "End - Failure: Unable to log in"
];

// Test case for access restriction
function testCase5() {
  meetingRoomBookingSimulation("access_restriction");
}
const expectedOutput5 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System informs the user of access restrictions",
  "System prompts the user to contact support for assistance",
  "End - Failure: User has access restrictions"
];

// Test case for cancelling reservation
function testCase6() {
  meetingRoomBookingSimulation("cancel_reservation");
}
const expectedOutput6 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects the option to view current bookings",
  "System displays the user's current bookings",
  "User selects the booking to cancel",
  "System prompts for confirmation of cancellation",
  "User confirms the cancellation",
  "System cancels the reservation",
  "System sends a cancellation confirmation to the user",
  "End - Success: Reservation cancelled successfully"
];

// Test case for invalid scenario
function testCase7() {
  meetingRoomBookingSimulation("invalid_scenario");
}
const expectedOutput7 = [
  "Start: User initiates meeting room booking process",
  "Invalid scenario",
  "End - Failure: Unknown scenario"
];

// Test case for successful booking (redundant)
function testCase8() {
  meetingRoomBookingSimulation("successful_booking");
}
const expectedOutput8 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully"
];

// Test case for room unavailable (redundant)
function testCase9() {
  meetingRoomBookingSimulation("room_unavailable");
}
const expectedOutput9 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "System informs the user that the selected room is not available",
  "System offers alternative rooms or time slots",
  "User selects an alternative room or time slot",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully with alternative"
];

// Test case for modifying time slot (redundant)
function testCase10() {
  meetingRoomBookingSimulation("modify_time_slot");
}
const expectedOutput10 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "User chooses to modify the time slot",
  "System prompts the user to select a new time slot",
  "User selects a new time slot",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully with modified time slot"
];

// Test case for login failure (redundant)
function testCase11() {
  meetingRoomBookingSimulation("login_failure");
}
const expectedOutput11 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System displays an error message",
  "System prompts the user to re-enter credentials",
  "User re-enters login credentials",
  "System displays an error message",
  "System prompts the user to contact support",
  "End - Failure: Unable to log in"
];

// Test case for access restriction (redundant)
function testCase12() {
  meetingRoomBookingSimulation("access_restriction");
}
const expectedOutput12 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System informs the user of access restrictions",
  "System prompts the user to contact support for assistance",
  "End - Failure: User has access restrictions"
];

// Test case for cancelling reservation (redundant)
function testCase13() {
  meetingRoomBookingSimulation("cancel_reservation");
}
const expectedOutput13 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects the option to view current bookings",
  "System displays the user's current bookings",
  "User selects the booking to cancel",
  "System prompts for confirmation of cancellation",
  "User confirms the cancellation",
  "System cancels the reservation",
  "System sends a cancellation confirmation to the user",
  "End - Success: Reservation cancelled successfully"
];

// Test case for invalid scenario (redundant)
function testCase14() {
  meetingRoomBookingSimulation("another_invalid_scenario");
}
const expectedOutput14 = [
  "Start: User initiates meeting room booking process",
  "Invalid scenario",
  "End - Failure: Unknown scenario"
];

// Test case for successful booking (redundant)
function testCase15() {
  meetingRoomBookingSimulation("successful_booking");
}
const expectedOutput15 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully"
];

// Test case for room unavailable (redundant)
function testCase16() {
  meetingRoomBookingSimulation("room_unavailable");
}
const expectedOutput16 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "System informs the user that the selected room is not available",
  "System offers alternative rooms or time slots",
  "User selects an alternative room or time slot",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully with alternative"
];

// Test case for modifying time slot (redundant)
function testCase17() {
  meetingRoomBookingSimulation("modify_time_slot");
}
const expectedOutput17 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects a room and time slot for the meeting",
  "System checks the availability of the selected room and time slot",
  "User chooses to modify the time slot",
  "System prompts the user to select a new time slot",
  "User selects a new time slot",
  "System checks the availability of the selected room and time slot",
  "System confirms the room is available",
  "System reserves the room for the user",
  "System sends a confirmation email to the user",
  "End - Success: Meeting room booked successfully with modified time slot"
];

// Test case for login failure (redundant)
function testCase18() {
  meetingRoomBookingSimulation("login_failure");
}
const expectedOutput18 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System displays an error message",
  "System prompts the user to re-enter credentials",
  "User re-enters login credentials",
  "System displays an error message",
  "System prompts the user to contact support",
  "End - Failure: Unable to log in"
];

// Test case for access restriction (redundant)
function testCase19() {
  meetingRoomBookingSimulation("access_restriction");
}
const expectedOutput19 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System informs the user of access restrictions",
  "System prompts the user to contact support for assistance",
  "End - Failure: User has access restrictions"
];

// Test case for cancelling reservation (redundant)
function testCase20() {
  meetingRoomBookingSimulation("cancel_reservation");
}
const expectedOutput20 = [
  "Start: User initiates meeting room booking process",
  "User logs in",
  "System authenticates the user",
  "System displays the booking interface",
  "User selects the option to view current bookings",
  "System displays the user's current bookings",
  "User selects the booking to cancel",
  "System prompts for confirmation of cancellation",
  "User confirms the cancellation",
  "System cancels the reservation",
  "System sends a cancellation confirmation to the user",
  "End - Success: Reservation cancelled successfully"
];
Make sure that the test cases only test the code and the stuff in the code, dont test scenarios that aren't present in the code. Look at the code very closely and make sure to line up the expected outputs. 
}`;


  try {
    // Call the Anthropic API to generate the test cases
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
      max_tokens: 4000, // Limit the number of tokens in the response
      temperature: 0, // Set temperature for deterministic output
      system: prompt, // Use the prompt defined above as the system message
      messages: [
        {
          role: 'user',
          content: prompt, // Provide a simple instruction as the content for the user message
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
