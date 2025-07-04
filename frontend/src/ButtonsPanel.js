import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from './apiService';
import * as shapeHelpers from './shapeHelpers';

export default function ButtonsPanel({
  editor,
  description,
  setDescription,
  notification,
  setNotification,
  setRunAllFunction, // Add this prop to connect canvas button
}) {
  // Local states
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isUseCaseLoading, setIsUseCaseLoading] = useState(false);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isTestCasesLoading, setIsTestCasesLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);

  // API Key format validation function
  const validateApiKeyFormat = (key) => {
    // Basic Claude API key format validation
    const trimmedKey = key.trim();
    
    // Claude API keys start with 'sk-ant-' and are quite long (usually 100+ characters)
    const isValidFormat = trimmedKey.startsWith('sk-ant-') && trimmedKey.length > 50;
    
    return isValidFormat;
  };

  // SIMPLIFIED: Just validate format, don't test the API in real-time
  // (We'll test it when the user actually clicks a button)
  useEffect(() => {
    const formatValid = validateApiKeyFormat(apiKey);
    setIsApiKeyValid(formatValid);
  }, [apiKey]);

  // Get input border color based on validation state
  const getInputBorderColor = () => {
    if (!apiKey) return '#e1e5e9'; // Default gray
    if (isApiKeyValid) return '#28a745'; // Green for valid format
    return '#dc3545'; // Red for invalid format
  };

  // Get validation message
  const getValidationMessage = () => {
    if (!apiKey) return '';
    if (isApiKeyValid) return 'API key format is valid';
    return 'Invalid API key format (should start with sk-ant-)';
  };

  // Get validation message color
  const getValidationMessageColor = () => {
    if (!apiKey) return '#6c757d';
    if (isApiKeyValid) return '#28a745'; // Green for valid format
    return '#dc3545'; // Red for invalid format
  };

  // Button base styles
  const buttonBaseStyle = {
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    minWidth: '200px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  };

  const disabledButtonStyle = {
    ...buttonBaseStyle,
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  // Determine if buttons should be enabled - just check if API key format is valid
  const buttonsEnabled = apiKey && isApiKeyValid;

  // ----------------------------
  // 1) Generate Use Case
  // ----------------------------
  const handleGoClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsUseCaseLoading(true);
    const loadingText = 'Use Case Description Generating...';

    // Create or update the "use case" shape
    shapeHelpers.createOrUpdateUseCaseShapes(editor, loadingText);

    let useCaseDescription;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      useCaseDescription = 'Please enter a description.';
    } else {
      useCaseDescription = await apiService.generateUseCase(description, apiKey);
    }

    // Update the final text
    shapeHelpers.updateUseCaseShape(editor, useCaseDescription);
    setIsUseCaseLoading(false);

    // Auto-fit all shapes on screen
    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 2) Generate Mermaid Markdown
  // ----------------------------
  const handleGenerateMermaidMarkdownClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsDiagramLoading(true);
    const loadingText = 'Mermaid Markdown Generating...';

    shapeHelpers.createOrUpdateMarkdownShapes(editor, loadingText);

    let diagram;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      diagram = 'Please enter a description.';
    } else {
      const useCaseDescription = shapeHelpers.shapeExists(editor, 'shape:usecasebox')
        ? editor.getShape('shape:usecasebox').props.text
        : 'Use case not available';

      diagram = await apiService.generateMermaidMarkdown(description, useCaseDescription, apiKey);
    }

    shapeHelpers.updateMarkdownShape(editor, diagram);
    setIsDiagramLoading(false);

    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 3) Generate Code
  // ----------------------------
  const handleGenerateCodeClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsCodeLoading(true);
    const loadingText = 'Code is Generating...';

    shapeHelpers.createOrUpdateCodeShapes(editor, loadingText);

    let code;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      code = 'Please enter a description.';
    } else {
      const useCaseDescription = shapeHelpers.shapeExists(editor, 'shape:usecasebox')
        ? editor.getShape('shape:usecasebox').props.text
        : 'Use case not available';

      code = await apiService.generateCode(description, useCaseDescription, apiKey);
    }

    shapeHelpers.updateCodeShape(editor, code);
    setIsCodeLoading(false);

    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 4) Generate Test Cases
  // ----------------------------
  const handleTestCasesClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsTestCasesLoading(true);
    const loadingText = 'Test Cases Are Generating...';

    shapeHelpers.createOrUpdateTestCasesShapes(editor, loadingText);

    let testCases;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      testCases = 'Please enter a description.';
    } else {
      const code = shapeHelpers.shapeExists(editor, 'shape:codebox')
        ? editor.getShape('shape:codebox').props.text
        : 'Code not available';

      testCases = await apiService.generateTestCases(description, code, apiKey);
    }

    shapeHelpers.updateTestCasesShape(editor, testCases);
    setIsTestCasesLoading(false);

    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 5) Run Tests
  // ----------------------------
  const handleRunTestsClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsResultsLoading(true);
    const loadingText = 'Running Tests...';

    shapeHelpers.createOrUpdateResultsShapes(editor, loadingText);

    let results;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      results = 'Please enter a description and generate code and test cases first.';
    } else {
      try {
        const code = shapeHelpers.shapeExists(editor, 'shape:codebox')
          ? editor.getShape('shape:codebox').props.text
          : '';
        const testCasesText = shapeHelpers.shapeExists(editor, 'shape:testcasebox')
          ? editor.getShape('shape:testcasebox').props.text
          : '';

        if (!code || !testCasesText) {
          throw new Error('Code or test cases are missing. Please generate them first.');
        }

        // Attempt to extract the function name from the code
        const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{/);
        if (!functionMatch) {
          throw new Error('No simulation function found in the provided code');
        }
        const simulationFunctionName = functionMatch[1];

        // Parse the test cases
        const testCases = parseTestCases(testCasesText, simulationFunctionName);

        results = await apiService.runTests(code, testCases);
      } catch (error) {
        console.error('Error running test cases:', error);
        results = `Error running test cases: ${error.message}`;
      }
    }

    shapeHelpers.updateResultsShape(editor, results);
    setIsResultsLoading(false);

    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 6) Run All Sequentially
  // ----------------------------
  const handleRunAllClick = useCallback(async () => {
    if (!buttonsEnabled) return;
    
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      alert('Please enter a description first!');
      return;
    }

    try {
      console.log('Starting sequential execution...');
      
      // Step 1: Generate Use Case
      console.log('Step 1: Generating Use Case...');
      setIsUseCaseLoading(true);
      const loadingText1 = 'Use Case Description Generating...';
      shapeHelpers.createOrUpdateUseCaseShapes(editor, loadingText1);
      const useCaseDescription = await apiService.generateUseCase(description, apiKey);
      shapeHelpers.updateUseCaseShape(editor, useCaseDescription);
      setIsUseCaseLoading(false);
      shapeHelpers.zoomOut(editor);
      
      // Step 2: Generate Diagram
      console.log('Step 2: Generating Diagram...');
      setIsDiagramLoading(true);
      const loadingText2 = 'Mermaid Markdown Generating...';
      shapeHelpers.createOrUpdateMarkdownShapes(editor, loadingText2);
      const diagram = await apiService.generateMermaidMarkdown(description, useCaseDescription, apiKey);
      shapeHelpers.updateMarkdownShape(editor, diagram);
      setIsDiagramLoading(false);
      shapeHelpers.zoomOut(editor);
      
      // Step 3: Generate Code
      console.log('Step 3: Generating Code...');
      setIsCodeLoading(true);
      const loadingText3 = 'Code is Generating...';
      shapeHelpers.createOrUpdateCodeShapes(editor, loadingText3);
      const code = await apiService.generateCode(description, useCaseDescription, apiKey);
      shapeHelpers.updateCodeShape(editor, code);
      setIsCodeLoading(false);
      shapeHelpers.zoomOut(editor);
      
      // Step 4: Generate Test Cases
      console.log('Step 4: Generating Test Cases...');
      setIsTestCasesLoading(true);
      const loadingText4 = 'Test Cases Are Generating...';
      shapeHelpers.createOrUpdateTestCasesShapes(editor, loadingText4);
      const testCases = await apiService.generateTestCases(useCaseDescription, code, apiKey);
      shapeHelpers.updateTestCasesShape(editor, testCases);
      setIsTestCasesLoading(false);
      shapeHelpers.zoomOut(editor);
      
      // Step 5: Run Tests
      console.log('Step 5: Running Tests...');
      setIsResultsLoading(true);
      const loadingText5 = 'Running Tests...';
      shapeHelpers.createOrUpdateResultsShapes(editor, loadingText5);
      
      // Extract function name and parse test cases
      const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{/);
      if (!functionMatch) {
        throw new Error('No simulation function found in the provided code');
      }
      const simulationFunctionName = functionMatch[1];
      const parsedTestCases = parseTestCases(testCases, simulationFunctionName);
      
      const results = await apiService.runTests(code, parsedTestCases);
      shapeHelpers.updateResultsShape(editor, results);
      setIsResultsLoading(false);
      shapeHelpers.zoomOut(editor);
      
      console.log('All steps completed successfully!');
      
    } catch (error) {
      console.error('Error in sequential execution:', error);
      
      // Reset all loading states in case of error
      setIsUseCaseLoading(false);
      setIsDiagramLoading(false);
      setIsCodeLoading(false);
      setIsTestCasesLoading(false);
      setIsResultsLoading(false);
      
      // Show error message in the results box
      shapeHelpers.createOrUpdateResultsShapes(editor, `Error in sequential execution: ${error.message}`);
    }
  }, [buttonsEnabled, description, editor, apiKey]);

  // Connect the handleRunAllClick function to the canvas button
  useEffect(() => {
    if (setRunAllFunction) {
      setRunAllFunction(() => handleRunAllClick);
    }
  }, [handleRunAllClick, setRunAllFunction]);

  function parseTestCases(testCasesText, simulationFunctionName) {
    const testCases = [];
    const testCaseRegex = new RegExp(
      `//\\s*Test case.*?\\n(function\\s+testCase\\d+\\s*\\(\\)\\s*{[\\s\\S]*?})\\s*const\\s+expectedOutput\\d+\\s*=\\s*\\[([\\s\\S]*?)\\];`,
      'g'
    );
    let match;

    while ((match = testCaseRegex.exec(testCasesText)) !== null) {
      const [, testFunction, expectedOutputArray] = match;
      const functionMatch = testFunction.match(/function\s+(testCase\d+)/);
      if (functionMatch) {
        const name = functionMatch[1];
        const scenarioMatch = testFunction.match(
          new RegExp(`${simulationFunctionName}\\("(\\w+)"\\)`)
        );
        const scenario = scenarioMatch ? scenarioMatch[1] : 'unknown';
        const expectedOutput = JSON.parse(`[${expectedOutputArray}]`);
        testCases.push({ name, scenario, expectedOutput });
      }
    }
    return testCases;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Enter API Key */}
      <div style={{ position: 'relative' }}>
        <input
          type="password"
          placeholder="Enter Claude API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: `2px solid ${getInputBorderColor()}`,
            marginBottom: '8px',
            fontSize: '18px',
            minWidth: '200px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
        {/* Validation status indicator */}
        {apiKey && (
          <div style={{
            fontSize: '12px',
            marginTop: '-4px',
            marginBottom: '8px',
            color: getValidationMessageColor(),
            fontWeight: '500',
          }}>
            {getValidationMessage()}
          </div>
        )}
      </div>

      {/* Generate Use Case */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#007bff',
        }}
        onClick={handleGoClick}
        disabled={!buttonsEnabled || isUseCaseLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isUseCaseLoading) {
            e.target.style.backgroundColor = '#0056b3';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isUseCaseLoading) {
            e.target.style.backgroundColor = '#007bff';
          }
        }}
      >
        {isUseCaseLoading ? 'Generating...' : 'Generate Use Case'}
      </button>

      {/* Generate Markdown */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#6f42c1',
        }}
        onClick={handleGenerateMermaidMarkdownClick}
        disabled={!buttonsEnabled || isDiagramLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isDiagramLoading) {
            e.target.style.backgroundColor = '#5a2d91';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isDiagramLoading) {
            e.target.style.backgroundColor = '#6f42c1';
          }
        }}
      >
        {isDiagramLoading ? 'Generating...' : 'Generate Flowchart'}
      </button>

      {/* Generate JavaScript Code */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#dc3545',
        }}
        onClick={handleGenerateCodeClick}
        disabled={!buttonsEnabled || isCodeLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isCodeLoading) {
            e.target.style.backgroundColor = '#c82333';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isCodeLoading) {
            e.target.style.backgroundColor = '#dc3545';
          }
        }}
      >
        {isCodeLoading ? 'Generating...' : 'Generate Code'}
      </button>

      {/* Generate Test Cases */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#28a745',
        }}
        onClick={handleTestCasesClick}
        disabled={!buttonsEnabled || isTestCasesLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isTestCasesLoading) {
            e.target.style.backgroundColor = '#218838';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isTestCasesLoading) {
            e.target.style.backgroundColor = '#28a745';
          }
        }}
      >
        {isTestCasesLoading ? 'Generating...' : 'Generate Test Cases'}
      </button>

      {/* Run Tests */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#fd7e14',
        }}
        onClick={handleRunTestsClick}
        disabled={!buttonsEnabled || isResultsLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isResultsLoading) {
            e.target.style.backgroundColor = '#e55a00';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isResultsLoading) {
            e.target.style.backgroundColor = '#fd7e14';
          }
        }}
      >
        {isResultsLoading ? 'Running...' : 'Run Tests'}
      </button>
    </div>
  );
}