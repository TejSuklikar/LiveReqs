// API service functions to communicate with the backend

const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.completion || data.results || 'No response received';
};

// 1. Generate Use Case from description
export const generateUseCase = async (description, apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usecase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        apiKey,
      }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating use case:', error);
    return `Error generating use case: ${error.message}`;
  }
};

// 2. Generate Mermaid Markdown from description and use case
export const generateMermaidMarkdown = async (description, useCaseDescription, apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/diagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        useCaseDescription,
        apiKey,
      }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating diagram:', error);
    return `Error generating diagram: ${error.message}`;
  }
};

// 3. Generate JavaScript code from description and use case
export const generateCode = async (description, useCaseDescription, apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        useCaseDescription,
        apiKey,
      }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating code:', error);
    return `Error generating code: ${error.message}`;
  }
};

// 4. Generate test cases from use case description and code
export const generateTestCases = async (useCaseDescription, code, apiKey) => {
  try {
    const response = await fetch(`${API_BASE_URL}/testcases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        useCaseDescription,
        code,
        apiKey,
      }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating test cases:', error);
    return `Error generating test cases: ${error.message}`;
  }
};

// 5. Run tests with code and test cases
export const runTests = async (code, testCases) => {
  try {
    const response = await fetch(`${API_BASE_URL}/runtests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        testCases,
      }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    // Format the test results for display
    if (data.results && Array.isArray(data.results)) {
      return data.results.join('\n\n');
    }
    return 'Tests completed but no results returned';
  } catch (error) {
    console.error('Error running tests:', error);
    return `Error running tests: ${error.message}`;
  }
};