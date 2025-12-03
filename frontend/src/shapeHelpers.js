import { createShapeId } from 'tldraw';

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
        x: 750,
        y: 250,
        props: {
          w: 600,
          h: 550,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'solid',
          size: 'm',
          font: 'sans',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:usecaselabel',
        type: 'text',
        x: 750,
        y: 200,
        props: {
          text: 'Use Case',
          size: 'l',
          font: 'sans',
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
          font: 'sans',
          dash: 'solid',
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
        x: 1450,
        y: 250,
        props: {
          w: 600,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'solid',
          size: 'm',
          font: 'sans',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:markdownlabel',
        type: 'text',
        x: 1450,
        y: 200,
        props: {
          text: 'Markdown',
          size: 'l',
          font: 'sans',
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
        props: {
          text: finalText,
          align: 'start',
          verticalAlign: 'start',
          font: 'sans',
          dash: 'solid',
        },
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

/**
 * Creates flowchart shapes from parsed Mermaid data using simple vertical layout
 * @param {Editor} editor - TLDraw editor instance
 * @param {Array} nodes - Parsed nodes from mermaidParser
 * @param {Array} edges - Parsed edges from mermaidParser
 */
export const createFlowchartShapes = (editor, nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    console.warn('No nodes to render');
    return;
  }

  console.log('=== FLOWCHART RENDERING START ===');
  console.log('Nodes:', nodes);
  console.log('Edges:', edges);

  // Delete existing flowchart shapes
  const existingFlowchartShapes = editor.getCurrentPageShapes()
    .filter(shape => shape.id.toString().includes('flowchart'));
  if (existingFlowchartShapes.length > 0) {
    console.log('Deleting existing shapes:', existingFlowchartShapes.length);
    editor.deleteShapes(existingFlowchartShapes.map(s => s.id));
  }

  const shapes = [];
  const nodePositions = new Map();

  // SIMPLE VERTICAL LAYOUT
  const startX = 1500;
  const startY = 300;
  const verticalSpacing = 250;  // More spacing between nodes

  // Create shapes vertically
  nodes.forEach((node, index) => {
    const y = startY + (index * verticalSpacing);
    nodePositions.set(node.id, { x: startX, y });

    const shapeConfig = getShapeConfigForNode(node);

    shapes.push({
      type: 'geo',
      x: startX,
      y: y,
      props: {
        geo: shapeConfig.geo,
        w: shapeConfig.w,
        h: shapeConfig.h,
        text: node.label || node.id,
        color: shapeConfig.color,
        fill: shapeConfig.fill,
        dash: 'solid',
        size: 'm',
        font: 'sans',  // CRITICAL: Use 'sans' not 'draw'
        align: 'middle',
        verticalAlign: 'middle',
      },
    });
  });

  console.log('Creating shapes:', shapes.length);

  // Create shapes
  const createdShapes = editor.createShapes(shapes);
  console.log('Created shapes:', createdShapes);

  // Create arrows
  const arrowShapes = [];
  edges.forEach((edge, index) => {
    const fromPos = nodePositions.get(edge.from);
    const toPos = nodePositions.get(edge.to);

    if (fromPos && toPos) {
      const fromShapeConfig = getShapeConfigForNode(nodes.find(n => n.id === edge.from));
      const toShapeConfig = getShapeConfigForNode(nodes.find(n => n.id === edge.to));

      if (fromShapeConfig && toShapeConfig) {
        arrowShapes.push({
          type: 'arrow',
          props: {
            start: {
              x: fromPos.x + (fromShapeConfig.w / 2),
              y: fromPos.y + fromShapeConfig.h
            },
            end: {
              x: toPos.x + (toShapeConfig.w / 2),
              y: toPos.y
            },
            color: edge.style === 'dotted' ? 'red' : 'black',
            dash: edge.style === 'dotted' ? 'dashed' : 'solid',
          },
        });
      }
    }
  });

  if (arrowShapes.length > 0) {
    console.log('Creating arrows:', arrowShapes.length);
    editor.createShapes(arrowShapes);
  }

  // Zoom to fit
  setTimeout(() => {
    editor.zoomToFit({ animation: { duration: 300 } });
  }, 100);

  console.log('=== FLOWCHART RENDERING COMPLETE ===');
};

/**
 * Get shape configuration based on node type
 */
function getShapeConfigForNode(node) {
  switch (node.type) {
    case 'ellipse':
      return { geo: 'ellipse', w: 200, h: 120, color: 'green', fill: 'solid' };
    case 'diamond':
      return { geo: 'diamond', w: 180, h: 180, color: 'red', fill: 'none' };
    case 'rectangle':
    default:
      return { geo: 'rectangle', w: 220, h: 120, color: 'blue', fill: 'none' };
  }
}
