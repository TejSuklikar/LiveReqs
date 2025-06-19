import { updateRectangleSize } from './textMeasurement';

// Set up event handlers for the Tldraw app
export const setupEventHandlers = (app, measureElement) => {
  // Handle shape changes - update rectangle size when text changes
  const handleShapeChanged = ({ shapes }) => {
    if (shapes.some((shape) => shape.id === 'shape:1')) {
      updateRectangleSize(app, measureElement);
    }
  };

  // Handle pointer clicks - show alert when button is clicked
  const handlePointerUp = (event) => {
    const shape = app.getShapeAtPoint(event.point);
    if (shape && shape.id === 'shape:3') {
      alert('Button clicked!');
    }
  };

  // Register event listeners
  app.on('shape:changed', handleShapeChanged);
  app.on('pointerup', handlePointerUp);

  // Return cleanup function
  return () => {
    app.off('shape:changed', handleShapeChanged);
    app.off('pointerup', handlePointerUp);
  };
};
