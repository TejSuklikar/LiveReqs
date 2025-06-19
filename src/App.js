import React from 'react';
import { Tldraw } from 'tldraw';
import './index.css';
import { createInitialShapes } from './initialShapes';
import { createMeasureElement, updateRectangleSize, removeMeasureElement } from './textMeasurement';
import { setupEventHandlers } from './eventHandlers';

export default function App() {
  const onMount = (app) => {
    // Create the hidden element for measuring text
    const measureElement = createMeasureElement();

    // Create the initial shapes on the canvas
    createInitialShapes(app);

    // Set up all event handlers
    const cleanupEventHandlers = setupEventHandlers(app, measureElement);

    // Trigger the initial size update
    updateRectangleSize(app, measureElement);

    // Return cleanup function
    return () => {
      cleanupEventHandlers();
      removeMeasureElement(measureElement);
    };
  };

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={onMount} />
    </div>
  );
}
