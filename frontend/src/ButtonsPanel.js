import React, { useState } from 'react';
import * as apiService from './apiService';
import * as shapeHelpers from './shapeHelpers';

export default function ButtonsPanel({
  editor,
  description,
  setDescription,
  notification,
  setNotification,
}) {
  // Local states
  const [apiKey, setApiKey] = useState('');
  const [isUseCaseLoading, setIsUseCaseLoading] = useState(false);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isTestCasesLoading, setIsTestCasesLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);

  // ----------------------------
  // 1) Generate Use Case
  // ----------------------------
  const handleGoClick = async () => {
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
        bottom: '50px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000,
      }}
    >
      {/* Enter API Key */}
      <input
        type="password"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{
          padding: '20px',
          borderRadius: '5px',
          border: '3px solid #000',
          marginBottom: '10px',
          color: '#000',
        }}
      />

      {/* Generate Use Case */}
      <button
        style={{
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: apiKey ? 'pointer' : 'not-allowed',
          whiteSpace: 'nowrap',
        }}
        onClick={handleGoClick}
        disabled={!apiKey}
      >
        Generate Use Case
      </button>

      {/* Generate Markdown */}
      <button
        style={{
          backgroundColor: 'purple',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: apiKey ? 'pointer' : 'not-allowed',
          whiteSpace: 'nowrap',
        }}
        onClick={handleGenerateMermaidMarkdownClick}
        disabled={!apiKey}
      >
        Generate Markdown
      </button>

      {/* Generate JavaScript Code */}
      <button
        style={{
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: apiKey ? 'pointer' : 'not-allowed',
          whiteSpace: 'nowrap',
        }}
        onClick={handleGenerateCodeClick}
        disabled={!apiKey}
      >
        Generate JavaScript Code
      </button>

      {/* Generate Test Cases */}
      <button
        style={{
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: apiKey ? 'pointer' : 'not-allowed',
          whiteSpace: 'nowrap',
        }}
        onClick={handleTestCasesClick}
        disabled={!apiKey}
      >
        Generate Test Cases
      </button>

      {/* Run Tests */}
      <button
        style={{
          backgroundColor: 'darkorange',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: apiKey ? 'pointer' : 'not-allowed',
          whiteSpace: 'nowrap',
        }}
        onClick={handleRunTestsClick}
        disabled={!apiKey}
      >
        Run Tests
      </button>
    </div>
  );
}
