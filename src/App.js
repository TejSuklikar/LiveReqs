import React, { useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import axios from 'axios';

export default function App() {
  const [editor, setEditor] = useState(null);
  const [description, setDescription] = useState('');
  const [showUseCaseBox, setShowUseCaseBox] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [showTestCasesBox, setShowTestCasesBox] = useState(false);
  const [showResultsBox, setShowResultsBox] = useState(false);
  const [notification, setNotification] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const onMount = (editor) => {
    setEditor(editor);

    editor.createShapes([
      {
        id: 'shape:1',
        type: 'geo',
        x: 100,
        y: 100,
        props: {
          w: 300,
          h: 150,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: 'Type here...',
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:2',
        type: 'text',
        x: 100,
        y: 50,
        props: {
          text: 'Description',
          size: 'l',
          font: 'draw',
          color: 'black',
        },
      },
    ]);

    editor.on('update', () => {
      const descriptionShape = editor.getShape('shape:1');
      if (descriptionShape) {
        setDescription(descriptionShape.props.text);
      }
    });
  };

  const handleGoClick = async () => {
    let useCaseDescription = 'Use Case Description';

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: {
            text: 'Type here...',
          },
        },
      ]);
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

    if (!showUseCaseBox) {
      editor.createShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          x: 500,
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
            align: 'start',
            verticalAlign: 'start',
          },
        },
        {
          id: 'shape:usecaselabel',
          type: 'text',
          x: 500,
          y: 50,
          props: {
            text: 'Use Case',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
      setShowUseCaseBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          props: {
            text: useCaseDescription,
          },
        },
      ]);
    }
  };

  const handleGenerateCodeClick = async () => {
    let code = 'JavaScript Code';

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: {
            text: 'Type here...',
          },
        },
      ]);
    } else {
      try {
        const useCaseDescription = editor.getShape('shape:usecasebox').props.text;
        const response = await axios.post('http://localhost:5001/api/code', {
          description: description,
          useCaseDescription: useCaseDescription,
          apiKey: apiKey,
        });
        code = response.data.completion || 'JavaScript Code';
      } catch (error) {
        console.error('Error generating JavaScript code:', error);
        code = 'Error generating code. Please try again.';
      }
    }

    if (!showCodeBox) {
      editor.createShapes([
        {
          id: 'shape:codebox',
          type: 'geo',
          x: 1250,
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
            align: 'start',
            verticalAlign: 'start',
          },
        },
        {
          id: 'shape:codelabel',
          type: 'text',
          x: 1250,
          y: 50,
          props: {
            text: 'Code',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
      setShowCodeBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:codebox',
          type: 'geo',
          props: {
            text: code,
          },
        },
      ]);
    }
  };

  const handleTestCasesClick = async () => {
    let testCases = 'Test Cases';

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: {
            text: 'Type here...',
          },
        },
      ]);
    } else {
      try {
        const code = editor.getShape('shape:codebox').props.text;
        const response = await axios.post('http://localhost:5001/api/testcases', {
          description: description,
          code: code,
          apiKey: apiKey,
        });
        testCases = response.data.completion || 'Test Cases';
      } catch (error) {
        console.error('Error generating test cases:', error);
        testCases = 'Error generating test cases. Please try again.';
      }
    }

    if (!showTestCasesBox) {
      editor.createShapes([
        {
          id: 'shape:testcasebox',
          type: 'geo',
          x: 2000,
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
            align: 'start',
            verticalAlign: 'start',
          },
        },
        {
          id: 'shape:testcaselabel',
          type: 'text',
          x: 2000,
          y: 50,
          props: {
            text: 'Test Cases',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
      setShowTestCasesBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:testcasebox',
          type: 'geo',
          props: {
            text: testCases,
          },
        },
      ]);
    }
  };

  const handleRunTestsClick = async () => {
    let results = 'Test Results';
    const code = editor.getShape('shape:codebox').props.text;
    const testCases = editor.getShape('shape:testcasebox').props.text;

    if (description.trim() === '' || description === 'Type here...') {
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: {
            text: 'Type here...',
          },
        },
      ]);
    } else {
      try {
        const response = await axios.post('http://localhost:5001/api/runtests', {
          code: code,
          testCases: testCases,
        });
        results = response.data.completion || 'Test Results';
      } catch (error) {
        console.error('Error running test cases:', error);
        results = 'Error running test cases. Please try again.';
      }
    }

    if (!showResultsBox) {
      editor.createShapes([
        {
          id: 'shape:resultsbox',
          type: 'geo',
          x: 2750,
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
            align: 'start',
            verticalAlign: 'start',
          },
        },
        {
          id: 'shape:resultslabel',
          type: 'text',
          x: 2750,
          y: 50,
          props: {
            text: 'Test Results',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
      setShowResultsBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:resultsbox',
          type: 'geo',
          props: {
            text: results,
          },
        },
      ]);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={onMount} />
      <div style={{
        position: 'absolute',
        bottom: '50px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000,
      }}>
        <input
          type="text"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            padding: '20px',
            borderRadius: '5px',
            border: '3px solid #000',
            marginBottom: '10px',
          }}
        />
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
          Use Case
        </button>
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
          onClick={handleGenerateCodeClick}
          disabled={!apiKey}
        >
          Generate Code
        </button>
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
      {notification && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'yellow',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1001,
        }}>
          {notification}
        </div>
      )}
    </div>
  );
}
