// Text measurement utilities for dynamically resizing shapes based on text content

export const createMeasureElement = () => {
  const measureElement = document.createElement('div');
  measureElement.style.position = 'absolute';
  measureElement.style.visibility = 'hidden';
  measureElement.style.whiteSpace = 'pre-wrap';
  measureElement.style.fontFamily = 'Inter';
  measureElement.style.fontSize = '16px';
  measureElement.style.lineHeight = '1.5';
  measureElement.style.padding = '10px';
  document.body.appendChild(measureElement);
  return measureElement;
};

export const updateRectangleSize = (app, measureElement) => {
  const textShape = app.getShape('shape:1');
  if (textShape && textShape.props.richText) {
    const textContent = textShape.props.richText.text || '';
    measureElement.innerText = textContent;
    const rect = measureElement.getBoundingClientRect();
    const padding = 40; // Increase padding for more space

    // Set minimum dimensions
    const minWidth = 500;   // ← Minimum width
    const minHeight = 300;  // ← Minimum height

    const newWidth = Math.max(rect.width + padding, minWidth);
    const newHeight = Math.max(rect.height + padding, minHeight);

    app.updateShapes([
      {
        id: 'shape:1',
        type: 'flowNode',  // Changed from 'geo' to 'flowNode'
        props: {
          w: newWidth,
          h: newHeight,
        },
      },
    ]);
  }
};

export const removeMeasureElement = (measureElement) => {
  if (measureElement && measureElement.parentNode) {
    document.body.removeChild(measureElement);
  }
};
