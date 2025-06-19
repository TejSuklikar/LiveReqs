const express = require('express');
const runCodeAndTests = require('../codeExecutor'); // Import the code execution function

const router = express.Router();

// Define a POST endpoint for running test cases
router.post('/', (req, res) => {
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

module.exports = router;