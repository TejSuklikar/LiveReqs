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
  if (textShape) {
    measureElement.innerText = textShape.props.text;
    const rect = measureElement.getBoundingClientRect();
    const padding = 20;

    const newWidth = rect.width + padding;
    const newHeight = rect.height + padding;

    app.updateShapes([
      {
        id: 'shape:1',
        type: 'geo',
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
