const { VM } = require('vm2');

const runCodeAndTests = (code, testCases) => {
  console.log("Received code:", code);
  console.log("Received test cases:", testCases);

  let results = [];

  const vm = new VM({
    timeout: 5000,
    sandbox: {
      console: {
        log: (...args) => {
          vm.output.push(args.join(' '));
        }
      },
      output: [],
    }
  });

  // Execute main code
  try {
    console.log("Executing main code");
    vm.run(code);
    results.push("Main code executed successfully");
  } catch (error) {
    results.push(`Error in main code: ${error.message}\nStack: ${error.stack}`);
    console.error("Error in main code:", error);
  }

  // Execute test cases
  testCases.split('\n\n').forEach((testCase, index) => {
    try {
      console.log(`Executing test case ${index + 1}`);
      vm.output = []; // Reset output for each test case
      
      // Extract expected output from test case
      const expectedOutputMatch = testCase.match(/const expectedOutput\d+ = \[([\s\S]*?)\];/);
      const expectedOutput = expectedOutputMatch 
        ? JSON.parse(`[${expectedOutputMatch[1]}]`) 
        : [];

      vm.run(testCase);
      const actualOutput = vm.output;

      // Compare expected and actual output
      const passed = JSON.stringify(expectedOutput) === JSON.stringify(actualOutput);

      results.push(`Test ${index + 1}: ${passed ? 'Passed' : 'Failed'}
Expected Output: ${expectedOutput.join(', ')}
Actual Output: ${actualOutput.join(', ')}
${passed ? '' : 'Test failed: outputs do not match'}`);

    } catch (error) {
      results.push(`Test ${index + 1}: Failed - ${error.message}\nStack: ${error.stack}`);
      console.error(`Error in test case ${index + 1}:`, error);
    }
  });

  return results.join('\n\n');
};

module.exports = runCodeAndTests;
