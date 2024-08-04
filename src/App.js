import React, { useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import axios from 'axios';

export default function App() {
  const [editor, setEditor] = useState(null);
  const [description, setDescription] = useState('');
  const [showUseCaseBox, setShowUseCaseBox] = useState(false);
  const [showTestCasesBox, setShowTestCasesBox] = useState(false);
  const [notification, setNotification] = useState(null);

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
          id: 'shape:3',
          type: 'geo',
          x: 600,
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
      ]);
      setShowUseCaseBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:3',
          type: 'geo',
          props: {
            text: useCaseDescription,
          },
        },
      ]);
    }
  };

  const handleTestCasesClick = async () => {
    let testCases = 'Test Cases';
    let newAlternateFlows = [];

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
        const response = await axios.post('http://localhost:5001/api/testcases', {
          description: description,
        });
        testCases = response.data.completion || 'Test Cases';
        newAlternateFlows = response.data.newAlternateFlows || [];
      } catch (error) {
        console.error('Error generating test cases:', error);
        testCases = 'Error generating test cases. Please try again.';
      }
    }

    if (!showTestCasesBox) {
      editor.createShapes([
        {
          id: 'shape:4',
          type: 'geo',
          x: 1350,
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
      ]);
      setShowTestCasesBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:4',
          type: 'geo',
          props: {
            text: testCases,
          },
        },
      ]);
    }

    // Update Use Case Description with new alternate flows
    if (newAlternateFlows.length > 0) {
      const useCaseShape = editor.getShape('shape:3');
      if (useCaseShape) {
        let updatedUseCaseText = useCaseShape.props.text;
        newAlternateFlows.forEach(flow => {
          updatedUseCaseText += `\n\nNew Alternate Flow:\n${flow}`;
        });

        editor.updateShapes([
          {
            id: 'shape:3',
            type: 'geo',
            props: {
              text: updatedUseCaseText,
            },
          },
        ]);

        setNotification("Use Case Description updated with new alternate flows.");
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        onMount={onMount}
      />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000,
      }}>
        <button
          style={{
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={handleGoClick}
        >
          Use Case
        </button>
        <button
          style={{
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={handleTestCasesClick}
        >
          Generate Test Cases
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
