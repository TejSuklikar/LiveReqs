const { VM } = require('vm2');

const runCodeAndTests = (code, testCases) => {
  const vm = new VM({
    timeout: 2000,
    sandbox: {},
  });

  let results = '';

  try {
    // Run the provided code
    vm.run(code);

    // Evaluate the test cases
    const testCaseResults = testCases.map((testCase, index) => {
      try {
        const result = vm.run(testCase.code);
        return `Test Case ${index + 1}: Passed\nTest Case Code: ${testCase.code}\nResult: ${result}`;
      } catch (error) {
        return `Test Case ${index + 1}: Failed - ${error.message}\nTest Case Code: ${testCase.code}\nExplanation: The test case failed due to a runtime error. Please check the code logic and ensure all variables and functions are correctly defined and accessible.`;
      }
    });

    results = testCaseResults.join('\n\n');
  } catch (error) {
    results = `Error executing code: ${error.message}`;
  }

  return results;
};

module.exports = runCodeAndTests;
