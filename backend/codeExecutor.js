const { VM } = require('vm2');

const runCodeAndTests = (code, testCases) => {
  let results = [];

  const vm = new VM({
    timeout: 5000,
    sandbox: {
      console: {
        log: function(...args) {
          if (!this.output) this.output = [];
          this.output.push(args.join(' '));
        }
      },
      output: [],
    }
  });

  // Execute the main code to define the libraryBookSystem function
  try {
    vm.run(code);
    results.push("Main code executed successfully");
  } catch (error) {
    results.push(`Error in main code: ${error.message}\nStack: ${error.stack}`);
    return results.join('\n\n');
  }

  // Execute each test case
  const testCaseRegex = /function\s+testCase\d+\s*\(\)\s*{[\s\S]*?}\s*const\s+expectedOutput\d+\s*=\s*\[[\s\S]*?\];/g;
  const testCaseMatches = testCases.match(testCaseRegex);

  if (!testCaseMatches) {
    results.push("No valid test cases found");
    return results.join('\n\n');
  }

  testCaseMatches.forEach((testCase, index) => {
    try {
      // Split the test case into the function and the expected output
      const [testCaseFunction, expectedOutputArray] = testCase.split(/const\s+expectedOutput\d+\s*=\s*/);
      const expectedOutput = eval(expectedOutputArray.trim());

      // Run the test case
      vm.sandbox.output = []; // Reset output for each test case
      vm.run(testCaseFunction.trim());  // Run the test case function

      const actualOutput = vm.sandbox.output;

      // Compare actual output to expected output
      const pass = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);

      results.push(`Test ${index + 1}:
Actual Output:
${actualOutput.join('\n')}
Expected Output:
${expectedOutput.join('\n')}
Result: ${pass ? "PASS" : "FAIL"}`);

    } catch (error) {
      results.push(`Test ${index + 1}: Failed - ${error.message}\nStack: ${error.stack}`);
    }
  });

  return results.join('\n\n');
};

module.exports = runCodeAndTests;
