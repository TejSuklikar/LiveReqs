const vm = require('node:vm');

const runCodeAndTests = (code, testCases) => {
  console.log("Received code:", code);
  console.log("Received test cases:", testCases);

  const context = {
    console: {
      log: (...args) => {
        console.log(...args);
      }
    },
    Math: Math,
  };

  const vmContext = vm.createContext(context);

  let results = [];

  // Execute main code
  try {
    console.log("Executing main code");
    vm.runInContext(code, vmContext, { timeout: 5000 });
    results.push("Main code executed successfully");
  } catch (error) {
    results.push(`Error in main code: ${error.message}\nStack: ${error.stack}`);
    console.error("Error in main code:", error);
    // Log the problematic code
    console.error("Problematic code:", code);
  }

  // Execute test cases
  testCases.split('\n\n').forEach((testCase, index) => {
    try {
      console.log(`Executing test case ${index + 1}`);
      console.log(`Test case code:\n${testCase}`);
      
      // Extract the function body
      const functionMatch = testCase.match(/function\s+testCase\d+\s*\((.*?)\)\s*\{([\s\S]*)\}/);
      if (!functionMatch) {
        throw new Error(`Invalid test case format for test case ${index + 1}`);
      }
      const functionBody = functionMatch[2];
      
      // Create a new function in the VM context and execute it
      const testFunction = vm.runInContext(`(function() {${functionBody}})`, vmContext);
      testFunction();
      results.push(`Test ${index + 1}: Passed`);
    } catch (error) {
      results.push(`Test ${index + 1}: Failed - ${error.message}\nStack: ${error.stack}`);
      console.error(`Error in test case ${index + 1}:`, error);
      // Log the problematic test case
      console.error(`Problematic test case ${index + 1}:`, testCase);
    }
  });

  return results.join('\n\n');
};

module.exports = runCodeAndTests;
