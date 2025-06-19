const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { callAnthropicWithRetry } = require('../utils/anthropicHelper');

const router = express.Router();

// Define a POST endpoint for generating test cases based on the provided use case description and simulation code
router.post('/', async (req, res) => {
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
Make sure that the test cases only test the code and the stuff in the code, dont test scenarios that aren't present in the code. Look at the code very closely and make sure to line up the expected outputs. 
}`;

  try {
    // Call the Anthropic API to generate the test cases
    const msg = await callAnthropicWithRetry(anthropic, {
      model: 'claude-opus-4-20250514', // Specify the model to use
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

module.exports = router;