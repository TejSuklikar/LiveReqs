const vm = require('vm');

function runCodeAndTests(code, testCases) {
  // Log received data for debugging purposes
  console.log("Received code:", code);
  console.log("Received testCases:", JSON.stringify(testCases, null, 2));

  // Create a sandboxed context for running the code
  // This includes a custom console.log function that captures output
  const context = {
    console: {
      log: function(...args) {
        this.output.push(args.join(' '));
      },
      output: []
    }
  };

  // Create a VM context with our sandboxed environment
  vm.createContext(context);

  let results = [];

  try {
    // Execute the main simulation code in the sandboxed context
    vm.runInContext(code, context);
    results.push("Main code executed successfully");

    // Extract the name of the simulation function from the provided code
    const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{/);
    if (!functionMatch) {
      throw new Error("No simulation function found in the provided code");
    }
    const simulationFunctionName = functionMatch[1];

    // Verify that the extracted function name actually exists in the context
    const isFunctionDefined = vm.runInContext(`typeof ${simulationFunctionName} === "function"`, context);
    if (!isFunctionDefined) {
      throw new Error(`${simulationFunctionName} function is not defined in the provided code`);
    }

    // Store the function name in the context for later use in test cases
    context.simulationFunctionName = simulationFunctionName;

  } catch (error) {
    // If there's an error in the main code execution, return it immediately
    return [`Error in main code: ${error.message}`];
  }

  // Execute each test case
  testCases.forEach(testCase => {
    // Reset the output capture for each test case
    context.console.output = [];
    try {
      // Run the simulation function with the test case's scenario
      vm.runInContext(`${context.simulationFunctionName}("${testCase.scenario}")`, context);
      const actualOutput = context.console.output;
      // Compare the actual output with the expected output
      const passed = JSON.stringify(actualOutput) === JSON.stringify(testCase.expectedOutput);
      
      // Format the results, including full output comparison if the test failed
      results.push(`Test: ${testCase.name}
Result: ${passed ? 'PASS' : 'FAIL'}
${passed ? '' : `Expected:\n${testCase.expectedOutput.join('\n')}\n\nActual:\n${actualOutput.join('\n')}`}`);
    } catch (error) {
      // If there's an error running the test case, include it in the results
      results.push(`Test: ${testCase.name}\nError: ${error.message}`);
    }
  });

  // Return all test results
  return results;
}

module.exports = runCodeAndTests;
