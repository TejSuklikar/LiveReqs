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

module.exports = { callAnthropicWithRetry };