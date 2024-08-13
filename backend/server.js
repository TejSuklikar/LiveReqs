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
  const prompt = `Convert the following Mermaid markdown and use case description into JavaScript code for a simulation. The code should use structured if/else or switch/case statements to handle different scenarios, representing all possible flows described in both the Mermaid diagram and the use case description.
  Guidelines:
  
  Function name and structure:
  
  Name the function based on the simulation context (e.g., librarySimulation, eCommerceSimulation).
  Use a 'scenario' parameter to control different flows.
  Structure the function with a main flow and branching logic for each decision point.
  
  
  Use case integration:
  
  Carefully read and incorporate all details from the use case description.
  Ensure that any specific scenarios, edge cases, or requirements mentioned in the use case are represented in the code.
  Use the terminology and naming conventions from the use case in your code for consistency.
  
  
  Code completeness and clarity:
  
  Include every flow and decision point from both the Mermaid diagram and use case description.
  Do not use ellipsis (...) or summarizing comments. Show the full code for each branch.
  Represent all possible outcomes, including error cases or unexpected scenarios.
  
  
  Coding style:
  
  Use clear, consistent indentation throughout.
  Prefer if/else statements for branching logic, using else if for multiple conditions.
  Always include a final 'else' statement to handle unexpected scenarios.
  Use descriptive variable names matching entities in the Mermaid diagram and use case.
  
  
  Console output:
  
  Use console.log statements for key actions and decisions at each step.
  Ensure console.log statements accurately reflect the simulation's state and flow.
  
  
  Code simplicity:
  
  Avoid unnecessary complexity. Do not include random number generation or external libraries.
  Focus on representing the logic flow described in the Mermaid diagram and use case.
  
  
  Output format:
  
  Provide only the JavaScript code without any introductory or concluding text.
  Ensure the entire function is visible and not truncated.
  
  
  
  Example structure:
  function eCommerceSimulation(scenario) {
  console.log("User accesses e-commerce website");
  console.log("System displays product catalog");
  console.log("User browses catalog");
  console.log("User selects items");

  if (scenario === "item_in_stock" || scenario === "proceed_to_checkout" || scenario === "modify_cart") {
    console.log("Item in stock");
    console.log("System adds items to cart");
    if (scenario === "proceed_to_checkout" || scenario === "valid_address" || scenario === "invalid_address" || scenario === "payment_successful" || scenario === "payment_failed") {
      console.log("User proceeds to checkout");
      console.log("System prompts for shipping info");
      console.log("User enters shipping info");
      if (scenario === "valid_address" || scenario === "payment_successful" || scenario === "payment_failed") {
        console.log("Valid address");
        console.log("System presents payment methods");
        console.log("User selects payment method");
        console.log("User confirms purchase");
        console.log("System processes payment");
        if (scenario === "payment_successful") {
          console.log("Payment successful");
          console.log("System generates order confirmation");
          console.log("System sends confirmation email");
          console.log("System processes order");
          if (scenario === "items_still_available" || scenario === "items_unavailable") {
            if (scenario === "items_still_available") {
              console.log("Items still available");
              console.log("System notifies Shipping Service");
              console.log("Shipping Service provides tracking number");
              console.log("System sends tracking number to user");
              console.log("User tracks shipment");
              if (scenario === "user_requests_cancellation" || scenario === "order_cancellable" || scenario === "order_not_cancellable") {
                console.log("User requests cancellation");
                if (scenario === "order_cancellable") {
                  console.log("Order cancellable");
                  console.log("System cancels order and initiates refund");
                  console.log("Use case ends in failure");
                } else if (scenario === "order_not_cancellable") {
                  console.log("Order not cancellable");
                  console.log("System informs user order can't be cancelled");
                  console.log("Shipping Service attempts delivery");
                  if (scenario === "delivery_successful") {
                    console.log("Delivery successful");
                    console.log("Use case ends in success");
                  } else if (scenario === "delivery_failed") {
                    console.log("Delivery failed");
                    console.log("System informs user of delivery issue");
                    if (scenario === "user_updates_info") {
                      console.log("User updates info");
                      console.log("System sends tracking number to user");
                    } else if (scenario === "user_requests_refund") {
                      console.log("User requests refund");
                      console.log("System processes refund");
                      console.log("Use case ends in failure");
                    }
                  }
                }
              } else {
                console.log("User does not request cancellation");
                console.log("Shipping Service attempts delivery");
                if (scenario === "delivery_successful") {
                  console.log("Delivery successful");
                  console.log("Use case ends in success");
                } else if (scenario === "delivery_failed") {
                  console.log("Delivery failed");
                  console.log("System informs user of delivery issue");
                  if (scenario === "user_updates_info") {
                    console.log("User updates info");
                    console.log("System sends tracking number to user");
                  } else if (scenario === "user_requests_refund") {
                    console.log("User requests refund");
                    console.log("System processes refund");
                    console.log("Use case ends in failure");
                  }
                }
              }
            } else if (scenario === "items_unavailable") {
              console.log("Items unavailable");
              console.log("System notifies user of unavailable items");
              if (scenario === "user_continues_with_available") {
                console.log("User continues with available items");
                console.log("System adjusts order and issues partial refund");
                console.log("System notifies Shipping Service");
                console.log("Shipping Service provides tracking number");
                console.log("System sends tracking number to user");
                console.log("User tracks shipment");
              } else if (scenario === "user_cancels_order") {
                console.log("User cancels order");
                console.log("System cancels order and issues full refund");
                console.log("Use case ends in failure");
              }
            }
          }
        } else if (scenario === "payment_failed") {
          console.log("Payment failed");
          console.log("System informs user of payment failure");
          if (scenario === "user_tries_another_method") {
            console.log("User tries another method");
            console.log("System presents payment methods");
          } else if (scenario === "user_abandons_purchase") {
            console.log("User abandons purchase");
            console.log("Use case ends in failure");
          }
        }
      } else if (scenario === "invalid_address") {
        console.log("Invalid address");
        console.log("User corrects shipping info");
      }
    } else if (scenario === "modify_cart") {
      console.log("User modifies cart");
    }
  } else if (scenario === "item_out_of_stock") {
    console.log("Item out of stock");
    console.log("System informs user item is out of stock");
    if (scenario === "user_continues_shopping") {
      console.log("User continues shopping");
      console.log("User browses catalog");
    } else if (scenario === "user_removes_item") {
      console.log("User removes item");
      console.log("System adds items to cart");
    }
  } else {
    console.log("Invalid scenario");
  }
}

This is another way to write the code:
function cricketBallDeliverySimulation(scenario) {
  console.log("Cricket match is in progress");
  console.log("Bowler is ready to bowl");
  console.log("Batter is at the crease");
  console.log("Umpire is in position");
  console.log("Bowler delivers the ball");
  console.log("System registers the ball has been bowled");

  switch (scenario) {
    case "hit":
      console.log("Batter decides to hit the ball");
      console.log("Batter hits the ball");
      console.log("System registers the ball has been hit");
      console.log("Use Case ends in Success");
      break;
    case "leave":
      console.log("Batter decides to leave the ball");
      break;
    case "miss":
      console.log("Batter decides to miss the ball");
      console.log("Batter misses the ball");
      console.log("Ball continues past the batter");
      break;
    case "strikes_stumps":
      console.log("Ball strikes the stumps");
      console.log("Umpire declares the batter out");
      console.log("System registers the batter as out");
      console.log("Use Case ends in Success");
      break;
    case "strikes_body":
      console.log("Ball strikes the batter's body");
      console.log("Umpire assesses if the ball would have hit the stumps");
      break;
    case "would_hit_stumps":
      console.log("Umpire determines the ball would have hit the stumps");
      console.log("Umpire declares the batter out LBW (Leg Before Wicket)");
      console.log("System registers the batter as out LBW");
      console.log("Use Case ends in Success");
      break;
    case "would_not_hit_stumps":
      console.log("Umpire determines the ball would not have hit the stumps");
      console.log("Continue play");
      console.log("Use Case ends in Success");
      break;
    case "passes_by":
      console.log("Ball passes by without hitting stumps or batter");
      console.log("Umpire assesses if the ball was too wide to hit");
      break;
    case "too_wide":
      console.log("Umpire determines the ball was too wide to hit");
      console.log("Umpire declares a wide ball");
      console.log("System adds one run to the batting team's score");
      console.log("System signals that the bowler must bowl another ball");
      console.log("Use Case continues from Step 1");
      break;
    case "not_too_wide":
      console.log("Umpire determines the ball was not too wide to hit");
      console.log("System registers the ball as a legal delivery");
      console.log("Use Case ends in Success");
      break;
    case "invalid_scenario":
      console.log("Invalid batter decision scenario");
      break;
    case "invalid_outcome":
      console.log("Invalid ball outcome scenario");
      break;
    case "invalid_lbw":
      console.log("Invalid LBW assessment scenario");
      break;
    case "invalid_width":
      console.log("Invalid width assessment scenario");
      break;
    default:
      console.log("Invalid scenario");
  }
}
  Ensure your code follows this structure, is complete, covers all possible flows from both the Mermaid diagram and use case description, and accurately represents the described simulation.
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

Generate at least 20 cases that cover all the possible flows described in the use case description and code. I want a minimum of 20 test cases for each time. Feel free to do more than 20 as well.

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
 THEY NEED TO BE ABLE TO EASILY RUN IN THIS CODE. IT SHOULD ONLY CREATE TESTS THAT SIMULATE THINGS HAPPENING IN THIS CODE STRUCUTRE. MAKE SURE THE EXPECTED OUTPUTS ARE CORRECT. 

 The code will be formatted like this:
 function cricketBallDeliverySimulation(scenario) {
  console.log("Cricket match is in progress");
  console.log("Bowler is ready to bowl");
  console.log("Batter is at the crease");
  console.log("Umpire is in position");
  console.log("Bowler delivers the ball");
  console.log("System registers the ball has been bowled");

  switch (scenario) {
    case "hit":
      console.log("Batter decides to hit the ball");
      console.log("Batter hits the ball");
      console.log("System registers the ball has been hit");
      console.log("Use Case ends in Success");
      break;
    case "leave":
      console.log("Batter decides to leave the ball");
      break;
    case "miss":
      console.log("Batter decides to miss the ball");
      console.log("Batter misses the ball");
      console.log("Ball continues past the batter");
      break;
    case "strikes_stumps":
      console.log("Ball strikes the stumps");
      console.log("Umpire declares the batter out");
      console.log("System registers the batter as out");
      console.log("Use Case ends in Success");
      break;
    case "strikes_body":
      console.log("Ball strikes the batter's body");
      console.log("Umpire assesses if the ball would have hit the stumps");
      break;
    case "would_hit_stumps":
      console.log("Umpire determines the ball would have hit the stumps");
      console.log("Umpire declares the batter out LBW (Leg Before Wicket)");
      console.log("System registers the batter as out LBW");
      console.log("Use Case ends in Success");
      break;
    case "would_not_hit_stumps":
      console.log("Umpire determines the ball would not have hit the stumps");
      console.log("Continue play");
      console.log("Use Case ends in Success");
      break;
    case "passes_by":
      console.log("Ball passes by without hitting stumps or batter");
      console.log("Umpire assesses if the ball was too wide to hit");
      break;
    case "too_wide":
      console.log("Umpire determines the ball was too wide to hit");
      console.log("Umpire declares a wide ball");
      console.log("System adds one run to the batting team's score");
      console.log("System signals that the bowler must bowl another ball");
      console.log("Use Case continues from Step 1");
      break;
    case "not_too_wide":
      console.log("Umpire determines the ball was not too wide to hit");
      console.log("System registers the ball as a legal delivery");
      console.log("Use Case ends in Success");
      break;
    case "invalid_scenario":
      console.log("Invalid batter decision scenario");
      break;
    case "invalid_outcome":
      console.log("Invalid ball outcome scenario");
      break;
    case "invalid_lbw":
      console.log("Invalid LBW assessment scenario");
      break;
    case "invalid_width":
      console.log("Invalid width assessment scenario");
      break;
    default:
      console.log("Invalid scenario");
  }
}
}
The test cases should be formatted something like this. Make sure that you model the test cases after the code so they always pass but cover everything thats in the code. 
The expected output should only contain the syntax from the code. Nothing else. Every word must be the exact same. Dont add anything else to an expected output if its not in the code. This is very important. 
Here are 20 test cases for the cricketBallDeliverySimulation function, covering all possible flows described in the code:

// Test case for batter hitting the ball
function testCase1() {
  cricketBallDeliverySimulation("hit");
}
const expectedOutput1 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Batter decides to hit the ball",
  "Batter hits the ball",
  "System registers the ball has been hit",
  "Use Case ends in Success"
];

// Test case for batter leaving the ball
function testCase2() {
  cricketBallDeliverySimulation("leave");
}
const expectedOutput2 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Batter decides to leave the ball"
];

// Test case for batter missing the ball
function testCase3() {
  cricketBallDeliverySimulation("miss");
}
const expectedOutput3 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Batter decides to miss the ball",
  "Batter misses the ball",
  "Ball continues past the batter"
];

// Test case for ball striking the stumps
function testCase4() {
  cricketBallDeliverySimulation("strikes_stumps");
}
const expectedOutput4 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Ball strikes the stumps",
  "Umpire declares the batter out",
  "System registers the batter as out",
  "Use Case ends in Success"
];

// Test case for ball striking the batter's body
function testCase5() {
  cricketBallDeliverySimulation("strikes_body");
}
const expectedOutput5 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Ball strikes the batter's body",
  "Umpire assesses if the ball would have hit the stumps"
];

// Test case for ball that would hit stumps (LBW)
function testCase6() {
  cricketBallDeliverySimulation("would_hit_stumps");
}
const expectedOutput6 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Umpire determines the ball would have hit the stumps",
  "Umpire declares the batter out LBW (Leg Before Wicket)",
  "System registers the batter as out LBW",
  "Use Case ends in Success"
];

// Test case for ball that would not hit stumps
function testCase7() {
  cricketBallDeliverySimulation("would_not_hit_stumps");
}
const expectedOutput7 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Umpire determines the ball would not have hit the stumps",
  "Continue play",
  "Use Case ends in Success"
];

// Test case for ball passing by without hitting stumps or batter
function testCase8() {
  cricketBallDeliverySimulation("passes_by");
}
const expectedOutput8 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Ball passes by without hitting stumps or batter",
  "Umpire assesses if the ball was too wide to hit"
];

// Test case for ball that is too wide
function testCase9() {
  cricketBallDeliverySimulation("too_wide");
}
const expectedOutput9 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Umpire determines the ball was too wide to hit",
  "Umpire declares a wide ball",
  "System adds one run to the batting team's score",
  "System signals that the bowler must bowl another ball",
  "Use Case continues from Step 1"
];

// Test case for ball that is not too wide
function testCase10() {
  cricketBallDeliverySimulation("not_too_wide");
}
const expectedOutput10 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Umpire determines the ball was not too wide to hit",
  "System registers the ball as a legal delivery",
  "Use Case ends in Success"
];

// Test case for invalid batter decision scenario
function testCase11() {
  cricketBallDeliverySimulation("invalid_scenario");
}
const expectedOutput11 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Invalid batter decision scenario"
];

// Test case for invalid ball outcome scenario
function testCase12() {
  cricketBallDeliverySimulation("invalid_outcome");
}
const expectedOutput12 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Invalid ball outcome scenario"
];

// Test case for invalid LBW assessment scenario
function testCase13() {
  cricketBallDeliverySimulation("invalid_lbw");
}
const expectedOutput13 = [
  "Cricket match is in progress",
  "Bowler is ready to bowl",
  "Batter is at the crease",
  "Umpire is in position",
  "Bowler delivers the ball",
  "System registers the ball has been bowled",
  "Invalid LBW assessment scenario"
];

// Test case for invalid width assessment scenario
function testCase14() {
  cricketBallDeliverySimulation("invalid_width");
}

Make sure that the test cases only test the code and the stuff in the code, dont test scenarios that aren't present in the code. Look at the code very closely and make sure to line up the expected outputs. 
}`;


  try {
    // Call the Anthropic API to generate the test cases
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-3-5-sonnet-20240620', // Specify the model to use
      max_tokens: 3000, // Limit the number of tokens in the response
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
