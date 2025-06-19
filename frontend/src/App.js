import React, { useState } from 'react';
import { Tldraw } from 'tldraw';
import './index.css';
import { createInitialShapes } from './initialShapes';
import { createMeasureElement, updateRectangleSize, removeMeasureElement } from './textMeasurement';
import { setupEventHandlers } from './eventHandlers';
import ButtonsPanel from './ButtonsPanel';

export default function App() {
  // State management for the app
  const [editor, setEditor] = useState(null);
  const [description, setDescription] = useState('Type here...');
  const [notification, setNotification] = useState('');

  const onMount = (app) => {
    // Store the editor instance in state
    setEditor(app);

    // Create the hidden element for measuring text
    const measureElement = createMeasureElement();

    // Create the initial shapes on the canvas
    createInitialShapes(app);

    // Set up all event handlers
    const cleanupEventHandlers = setupEventHandlers(app, measureElement);

    // Trigger the initial size update
    updateRectangleSize(app, measureElement);

    // Set up listener to sync description with text shape changes
    const handleShapeChanged = () => {
      const textShape = app.getShape('shape:1');
      if (textShape && textShape.props.text !== description) {
        setDescription(textShape.props.text);
      }
    };

    // Listen for shape changes to keep description in sync
    app.on('shape:changed', handleShapeChanged);

    // Return cleanup function
    return () => {
      cleanupEventHandlers();
      removeMeasureElement(measureElement);
      app.off('shape:changed', handleShapeChanged);
    };
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={onMount} />
      
      {/* Render the buttons panel if editor is ready */}
      {editor && (
        <ButtonsPanel
          editor={editor}
          description={description}
          setDescription={setDescription}
          notification={notification}
          setNotification={setNotification}
        />
      )}
    </div>
  );
}