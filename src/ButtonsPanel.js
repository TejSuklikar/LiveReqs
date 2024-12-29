import React, { useState } from 'react';
import axios from 'axios';

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

  // Helper to check if a shape with ID shapeId exists
  const shapeExists = (shapeId) => editor && editor.getShape(shapeId) !== undefined;

  // ----------------------------
  // 1) Generate Use Case
  // ----------------------------
  const handleGoClick = async () => {
    setIsUseCaseLoading(true);
    let useCaseDescription = 'Use Case Description Generating...';

    // Create or update the "use case" shape
    if (!shapeExists('shape:usecasebox')) {
      editor.createShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          x: 800,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: useCaseDescription,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:usecaselabel',
          type: 'text',
          x: 800,
          y: 50,
          props: {
            text: 'Use Case',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
    } else {
      editor.updateShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          props: { text: useCaseDescription },
        },
      ]);
    }

    if (description.trim() === '' || description === 'Type here...') {
      // Reset if empty
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: { text: 'Type here...' },
        },
      ]);
      useCaseDescription = 'Please enter a description.';
    } else {
      try {
        const response = await axios.post('http://localhost:5001/api/usecase', {
          description: description,
          apiKey: apiKey,
        });
        useCaseDescription = response.data.completion || 'Use Case Description';
      } catch (error) {
        console.error('Error generating use case description:', error);
        useCaseDescription = 'Error generating use case. Please try again.';
      }
    }

    // Update final text
    if (shapeExists('shape:usecasebox')) {
      editor.updateShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          props: {
            text: useCaseDescription,
            align: 'start',
            verticalAlign: 'start',
          },
        },
      ]);
    }
    setIsUseCaseLoading(false);
  };

  // ----------------------------
  // 2) Generate Mermaid Markdown
  // ----------------------------
  const handleGenerateMermaidMarkdownClick = async () => {
    setIsDiagramLoading(true);
    let diagram = 'Mermaid Markdown Generating...';

    // Create or update the "markdown" shape
    if (!shapeExists('shape:markdownbox')) {
      editor.createShapes([
        {
          id: 'shape:markdownbox',
          type: 'geo',
          x: 1600,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: diagram,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:markdownlabel',
          type: 'text',
          x: 1600,
          y: 50,
          props: {
            text: 'Markdown',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
    } else {
      editor.updateShapes([
        {
          id: 'shape:markdownbox',
          type: 'geo',
          props: { text: diagram },
        },
      ]);
    }

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: { text: 'Type here...' },
        },
      ]);
      diagram = 'Please enter a description.';
    } else {
      try {
        const useCaseDescription = shapeExists('shape:usecasebox')
          ? editor.getShape('shape:usecasebox').props.text
          : 'Use case not available';

        const response = await axios.post('http://localhost:5001/api/diagram', {
          description,
          useCaseDescription,
          apiKey,
        });
        diagram = response.data.completion || 'Mermaid Markdown';
      } catch (error) {
        console.error('Error generating Mermaid Markdown:', error);
        diagram = 'Error generating diagram. Please try again.';
      }
    }

    if (shapeExists('shape:markdownbox')) {
      editor.updateShapes([
        {
          id: 'shape:markdownbox',
          type: 'geo',
          props: { text: diagram, align: 'start', verticalAlign: 'start' },
        },
      ]);
    }
    setIsDiagramLoading(false);
  };

  // ----------------------------
  // 3) Generate Code
  // ----------------------------
  const handleGenerateCodeClick = async () => {
    setIsCodeLoading(true);
    let code = 'Code is Generating...';

    if (!shapeExists('shape:codebox')) {
      editor.createShapes([
        {
          id: 'shape:codebox',
          type: 'geo',
          x: 2400,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: code,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:codelabel',
          type: 'text',
          x: 2400,
          y: 50,
          props: {
            text: 'Code',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
    } else {
      editor.updateShapes([
        {
          id: 'shape:codebox',
          type: 'geo',
          props: { text: code },
        },
      ]);
    }

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: { text: 'Type here...' },
        },
      ]);
      code = 'Please enter a description.';
    } else {
      try {
        const useCaseDescription = shapeExists('shape:usecasebox')
          ? editor.getShape('shape:usecasebox').props.text
          : 'Use case not available';

        const response = await axios.post('http://localhost:5001/api/code', {
          description,
          useCaseDescription,
          apiKey,
        });
        code = response.data.completion || 'JavaScript Code';
      } catch (error) {
        console.error('Error generating JavaScript code:', error);
        code = 'Error generating code. Please try again.';
      }
    }

    if (shapeExists('shape:codebox')) {
      editor.updateShapes([
        {
          id: 'shape:codebox',
          type: 'geo',
          props: { text: code, align: 'start', verticalAlign: 'start' },
        },
      ]);
    }
    setIsCodeLoading(false);
  };

  // ----------------------------
  // 4) Generate Test Cases
  // ----------------------------
  const handleTestCasesClick = async () => {
    setIsTestCasesLoading(true);
    let testCases = 'Test Cases Are Generating...';

    if (!shapeExists('shape:testcasebox')) {
      editor.createShapes([
        {
          id: 'shape:testcasebox',
          type: 'geo',
          x: 3200,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: testCases,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:testcaselabel',
          type: 'text',
          x: 3200,
          y: 50,
          props: {
            text: 'Test Cases',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
    } else {
      editor.updateShapes([
        {
          id: 'shape:testcasebox',
          type: 'geo',
          props: { text: testCases },
        },
      ]);
    }

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        { id: 'shape:1', type: 'geo', props: { text: 'Type here...' } },
      ]);
      testCases = 'Please enter a description.';
    } else {
      try {
        const code = shapeExists('shape:codebox')
          ? editor.getShape('shape:codebox').props.text
          : 'Code not available';

        const response = await axios.post('http://localhost:5001/api/testcases', {
          description,
          code,
          apiKey,
        });
        testCases = response.data.completion || 'Test Cases';
      } catch (error) {
        console.error('Error generating test cases:', error);
        testCases = 'Error generating test cases. Please try again.';
      }
    }

    if (shapeExists('shape:testcasebox')) {
      editor.updateShapes([
        {
          id: 'shape:testcasebox',
          type: 'geo',
          props: { text: testCases, align: 'start', verticalAlign: 'start' },
        },
      ]);
    }
    setIsTestCasesLoading(false);
  };

  // ----------------------------
  // 5) Run Tests
  // ----------------------------
  const handleRunTestsClick = async () => {
    setIsResultsLoading(true);
    let results = 'Running Tests...';

    if (!shapeExists('shape:resultsbox')) {
      editor.createShapes([
        {
          id: 'shape:resultsbox',
          type: 'geo',
          x: 4000,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: results,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:resultslabel',
          type: 'text',
          x: 4000,
          y: 50,
          props: {
            text: 'Test Results',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
    } else {
      editor.updateShapes([
        { id: 'shape:resultsbox', type: 'geo', props: { text: results } },
      ]);
    }

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        { id: 'shape:1', type: 'geo', props: { text: 'Type here...' } },
      ]);
      results = 'Please enter a description and generate code and test cases first.';
    } else {
      try {
        const code = shapeExists('shape:codebox')
          ? editor.getShape('shape:codebox').props.text
          : '';
        const testCasesText = shapeExists('shape:testcasebox')
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

        console.log('Sending code:', code);
        console.log('Sending test cases:', testCases);

        // Send them to the backend for execution
        const response = await axios.post('http://localhost:5001/api/runtests', {
          code,
          testCases,
        });
        results = response.data.results ? response.data.results.join('\n\n') : 'Test Results';
        console.log('Test Results:', results);
      } catch (error) {
        console.error('Error running test cases:', error);
        results = `Error running test cases: ${error.message}`;
      }
    }

    if (shapeExists('shape:resultsbox')) {
      editor.updateShapes([
        {
          id: 'shape:resultsbox',
          type: 'geo',
          props: { text: results, align: 'start', verticalAlign: 'start' },
        },
      ]);
    }
    setIsResultsLoading(false);
  };

  // Same helper function as in your original code
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

  // Render the actual panel with the 5 buttons + API key input
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
          backgroundColor: 'orange',
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
