// API service functions to communicate with the backend

const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to validate API key format
const validateApiKey = (apiKey) => {
  const issues = [];
  
  if (!apiKey) {
    issues.push('API key is empty');
  } else {
    if (!apiKey.startsWith('sk-ant-')) {
      issues.push('API key should start with "sk-ant-"');
    }
    
    if (apiKey.includes(' ')) {
      issues.push('API key contains spaces');
    }
    
    if (apiKey.length < 50) {
      issues.push('API key seems too short');
    }
  }
  
  return issues;
};

// Enhanced helper function to handle API responses with detailed error logging
const handleApiResponse = async (response) => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    let errorDetails;
    try {
      // Try to get the error response as JSON first
      errorDetails = await response.json();
      console.error('Error response body (JSON):', errorDetails);
    } catch (jsonError) {
      // If JSON parsing fails, get as text
      try {
        errorDetails = await response.text();
        console.error('Error response body (Text):', errorDetails);
      } catch (textError) {
        console.error('Could not read error response body');
        errorDetails = 'Could not read error response';
      }
    }
    
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorDetails)}`);
  }
  
  const data = await response.json();
  console.log('Success response data:', data);
  return data.completion || data.results || 'No response received';
};

// Function to test API key directly with Anthropic
export const testApiKey = async (apiKey) => {
  console.log('Testing API key directly with Anthropic...');
  console.log('API Key format:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      })
    });

    console.log('Direct API test response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Direct API test failed:', errorText);
      return `API Key test failed: ${response.status} - ${errorText}`;
    }

    const data = await response.json();
    console.log('Direct API test success:', data);
    return 'API Key is valid!';
  } catch (error) {
    console.error('Direct API test error:', error);
    return `API Key test error: ${error.message}`;
  }
};

// 1. Generate Use Case from description
export const generateUseCase = async (description, apiKey) => {
  console.log('=== GENERATE USE CASE DEBUG ===');
  console.log('Description:', description);
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  // Validate API key first
  const keyIssues = validateApiKey(apiKey);
  if (keyIssues.length > 0) {
    console.error('API Key validation issues:', keyIssues);
    return `API Key Issues: ${keyIssues.join(', ')}`;
  }
  
  try {
    console.log('Sending request to:', `${API_BASE_URL}/usecase`);
    
    const requestBody = {
      description,
      apiKey,
    };
    console.log('Request body:', { ...requestBody, apiKey: apiKey.substring(0, 10) + '...' });
    
    const response = await fetch(`${API_BASE_URL}/usecase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating use case:', error);
    console.error('Error stack:', error.stack);
    return `Error generating use case: ${error.message}`;
  }
};

// 2. Generate Mermaid Markdown from description and use case
export const generateMermaidMarkdown = async (description, useCaseDescription, apiKey) => {
  console.log('=== GENERATE MERMAID DEBUG ===');
  console.log('Description:', description);
  console.log('Use Case Description length:', useCaseDescription?.length || 0);
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  const keyIssues = validateApiKey(apiKey);
  if (keyIssues.length > 0) {
    console.error('API Key validation issues:', keyIssues);
    return `API Key Issues: ${keyIssues.join(', ')}`;
  }
  
  try {
    const requestBody = {
      description,
      useCaseDescription,
      apiKey,
    };
    console.log('Request body:', { ...requestBody, apiKey: apiKey.substring(0, 10) + '...' });
    
    const response = await fetch(`${API_BASE_URL}/diagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating diagram:', error);
    console.error('Error stack:', error.stack);
    return `Error generating diagram: ${error.message}`;
  }
};

// 3. Generate JavaScript code from description and use case
export const generateCode = async (description, useCaseDescription, apiKey) => {
  console.log('=== GENERATE CODE DEBUG ===');
  console.log('Description:', description);
  console.log('Use Case Description length:', useCaseDescription?.length || 0);
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  const keyIssues = validateApiKey(apiKey);
  if (keyIssues.length > 0) {
    console.error('API Key validation issues:', keyIssues);
    return `API Key Issues: ${keyIssues.join(', ')}`;
  }
  
  try {
    const requestBody = {
      description,
      useCaseDescription,
      apiKey,
    };
    console.log('Request body:', { ...requestBody, apiKey: apiKey.substring(0, 10) + '...' });
    
    const response = await fetch(`${API_BASE_URL}/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating code:', error);
    console.error('Error stack:', error.stack);
    return `Error generating code: ${error.message}`;
  }
};

// 4. Generate test cases from use case description and code
export const generateTestCases = async (useCaseDescription, code, apiKey) => {
  console.log('=== GENERATE TEST CASES DEBUG ===');
  console.log('Use Case Description length:', useCaseDescription?.length || 0);
  console.log('Code length:', code?.length || 0);
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  const keyIssues = validateApiKey(apiKey);
  if (keyIssues.length > 0) {
    console.error('API Key validation issues:', keyIssues);
    return `API Key Issues: ${keyIssues.join(', ')}`;
  }
  
  try {
    const requestBody = {
      useCaseDescription,
      code,
      apiKey,
    };
    console.log('Request body:', { ...requestBody, apiKey: apiKey.substring(0, 10) + '...' });
    
    const response = await fetch(`${API_BASE_URL}/testcases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Error generating test cases:', error);
    console.error('Error stack:', error.stack);
    return `Error generating test cases: ${error.message}`;
  }
};

// 5. Run tests with code and test cases
export const runTests = async (code, testCases) => {
  console.log('=== RUN TESTS DEBUG ===');
  console.log('Code length:', code?.length || 0);
  console.log('Test cases:', testCases);
  
  try {
    const requestBody = {
      code,
      testCases,
    };
    console.log('Request body:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/runtests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Run tests response status:', response.status);
    
    const data = await response.json();
    console.log('Run tests response data:', data);
    
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
    console.error('Error stack:', error.stack);
    return `Error running tests: ${error.message}`;
  }
};