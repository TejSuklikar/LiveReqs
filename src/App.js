import React, { useEffect, useRef, useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import axios from 'axios';

export default function App() {
  const [editor, setEditor] = useState(null);
  const [description, setDescription] = useState('');
  const [showUseCaseBox, setShowUseCaseBox] = useState(false);
  const goButtonRef = useRef(null);

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

    // Position the Go button
    const descriptionShape = editor.getShape('shape:1');
    if (descriptionShape && goButtonRef.current) {
      const rect = editor.getShapePageBounds(descriptionShape.id);
      if (rect) {
        const viewportRect = editor.getViewportPageBounds();
        goButtonRef.current.style.left = `${rect.x + rect.width + 20 - viewportRect.x}px`;
        goButtonRef.current.style.top = `${rect.y - viewportRect.y}px`;
      }
    }
  };

  const handleGoClick = async () => {
    let useCaseDescription = 'Use Case Description';

    if (description.trim() === '' || description === 'Type here...') {
      // Reset the Description box to its initial state
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

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        onMount={onMount}
      />
      <button
        ref={goButtonRef}
        style={{
          position: 'fixed',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={handleGoClick}
      >
        Go
      </button>
    </div>
  );
}