// Helper: Check if a shape with a given ID exists
export const shapeExists = (editor, shapeId) => editor && editor.getShape(shapeId) !== undefined;

// Helper: Zoom out by reducing zoom level
export const zoomOut = (editor) => {
  if (!editor) return;

  // Get the current camera state
  const { x, y, z } = editor.getCamera();

  // Calculate new zoom level (reduce by 10%)
  const newZoom = z * 0.85;

  // Update the camera with the new zoom level
  editor.setCamera({ x, y, z: newZoom });
};

// Create or update Use Case shapes
export const createOrUpdateUseCaseShapes = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:usecasebox')) {
    editor.createShapes([
      {
        id: 'shape:usecasebox',
        type: 'geo',
        x: 430,
        y: 200,
        props: {
          w: 450,
          h: 550,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:usecaselabel',
        type: 'text',
        x: 500,
        y: 150,
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
        props: { text: loadingText },
      },
    ]);
  }
};

// Update Use Case shape with final text
export const updateUseCaseShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:usecasebox')) {
    editor.updateShapes([
      {
        id: 'shape:usecasebox',
        type: 'geo',
        props: {
          text: finalText,
          align: 'start',
          verticalAlign: 'start',
        },
      },
    ]);
  }
};

// Create or update Markdown shapes
export const createOrUpdateMarkdownShapes = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:markdownbox')) {
    editor.createShapes([
      {
        id: 'shape:markdownbox',
        type: 'geo',
        x: 900,
        y: 200,
        props: {
          w: 500,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:markdownlabel',
        type: 'text',
        x: 1000,
        y: 150,
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
        props: { text: loadingText },
      },
    ]);
  }
};

// Update Markdown shape with final text
export const updateMarkdownShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:markdownbox')) {
    editor.updateShapes([
      {
        id: 'shape:markdownbox',
        type: 'geo',
        props: { text: finalText, align: 'start', verticalAlign: 'start' },
      },
    ]);
  }
};

// Create or update Code shapes
export const createOrUpdateCodeShapes = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:codebox')) {
    editor.createShapes([
      {
        id: 'shape:codebox',
        type: 'geo',
        x: 1420,
        y: 200,
        props: {
          w: 580,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:codelabel',
        type: 'text',
        x: 1600,
        y: 150,
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
        props: { text: loadingText },
      },
    ]);
  }
};

// Update Code shape with final text
export const updateCodeShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:codebox')) {
    editor.updateShapes([
      {
        id: 'shape:codebox',
        type: 'geo',
        props: { text: finalText, align: 'start', verticalAlign: 'start' },
      },
    ]);
  }
};

// Create or update Test Cases shapes
export const createOrUpdateTestCasesShapes = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:testcasebox')) {
    editor.createShapes([
      {
        id: 'shape:testcasebox',
        type: 'geo',
        x: 2020,
        y: 200,
        props: {
          w: 650,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:testcaselabel',
        type: 'text',
        x: 2200,
        y: 150,
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
        props: { text: loadingText },
      },
    ]);
  }
};

// Update Test Cases shape with final text
export const updateTestCasesShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:testcasebox')) {
    editor.updateShapes([
      {
        id: 'shape:testcasebox',
        type: 'geo',
        props: { text: finalText, align: 'start', verticalAlign: 'start' },
      },
    ]);
  }
};

// Create or update Results shapes
export const createOrUpdateResultsShapes = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:resultsbox')) {
    editor.createShapes([
      {
        id: 'shape:resultsbox',
        type: 'geo',
        x: 2690,
        y: 200,
        props: {
          w: 650,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:resultslabel',
        type: 'text',
        x: 2900,
        y: 150,
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
      { id: 'shape:resultsbox', type: 'geo', props: { text: loadingText } },
    ]);
  }
};

// Update Results shape with final text
export const updateResultsShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:resultsbox')) {
    editor.updateShapes([
      {
        id: 'shape:resultsbox',
        type: 'geo',
        props: { text: finalText, align: 'start', verticalAlign: 'start' },
      },
    ]);
  }
};

// Update description shape
export const updateDescriptionShape = (editor, text) => {
  editor.updateShapes([
    {
      id: 'shape:1',
      type: 'geo',
      props: { text: text },
    },
  ]);
};
