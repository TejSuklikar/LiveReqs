const { VM } = require('vm2');

function runCodeAndTests(code, testCases) {
  // Log received data for debugging purposes
  console.log("Received code:", code);
  console.log("Received testCases:", JSON.stringify(testCases, null, 2));

  // Create a sandboxed environment with vm2
  const vm = new VM({
    sandbox: {
      console: {
        log: function(...args) {
          this.output.push(args.join(' '));
        },
        output: []
      }
    }
  });

  let results = [];

  try {
    // Execute the main simulation code in the sandboxed environment
    vm.run(code);
    results.push("Main code executed successfully");

    // Extract the name of the simulation function from the provided code
    const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{/);
    if (!functionMatch) {
      throw new Error("No simulation function found in the provided code");
    }
    const simulationFunctionName = functionMatch[1];

    // Verify that the extracted function name actually exists in the context
    const isFunctionDefined = vm.run(`typeof ${simulationFunctionName} === "function"`);
    if (!isFunctionDefined) {
      throw new Error(`${simulationFunctionName} function is not defined in the provided code`);
    }

    // Store the function name in the sandbox for later use in test cases
    vm.sandbox.simulationFunctionName = simulationFunctionName;

  } catch (error) {
    // If there's an error in the main code execution, return it immediately
    return [`Error in main code: ${error.message}`];
  }

  // Execute each test case
  testCases.forEach(testCase => {
    // Reset the output capture for each test case
    vm.sandbox.console.output = [];
    try {
      // Run the simulation function with the test case's scenario
      vm.run(`${vm.sandbox.simulationFunctionName}("${testCase.scenario}")`);
      const actualOutput = vm.sandbox.console.output;
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