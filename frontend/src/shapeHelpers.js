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

// Create or update Flowchart loading box
export const createOrUpdateFlowchartLoadingBox = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:flowchartloadingbox')) {
    editor.createShapes([
      {
        id: 'shape:flowchartloadingbox',
        type: 'geo',
        x: 2200,
        y: 300,
        props: {
          w: 400,
          h: 200,
          geo: 'rectangle',
          color: 'violet',
          fill: 'solid',
          dash: 'solid',
          size: 'm',
          font: 'sans',
          text: loadingText,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:flowchartloadinglabel',
        type: 'text',
        x: 2200,
        y: 250,
        props: {
          text: 'Flowchart',
          size: 'l',
          font: 'sans',
          color: 'black',
        },
      },
    ]);
  } else {
    editor.updateShapes([
      {
        id: 'shape:flowchartloadingbox',
        type: 'geo',
        props: { text: loadingText },
      },
    ]);
  }
};

/**
 * Calculate hierarchical layout for flowchart nodes
 * @param {Array} nodes - Parsed nodes
 * @param {Array} edges - Parsed edges
 * @returns {Map} nodeId -> {x, y, level, column}
 */
function calculateHierarchicalLayout(nodes, edges) {
  const positions = new Map();
  const inDegree = new Map();
  const outEdges = new Map();
  const levels = new Map();

  // Initialize structures
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    outEdges.set(node.id, []);
  });

  // Build adjacency info
  edges.forEach(edge => {
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    const outList = outEdges.get(edge.from) || [];
    outList.push(edge.to);
    outEdges.set(edge.from, outList);
  });

  // Find root nodes (no incoming edges)
  const roots = nodes.filter(node => inDegree.get(node.id) === 0);

  // If no roots found, use first node
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0]);
  }

  // BFS to assign levels
  const queue = [];
  roots.forEach(root => {
    levels.set(root.id, 0);
    queue.push(root.id);
  });

  while (queue.length > 0) {
    const nodeId = queue.shift();
    const currentLevel = levels.get(nodeId);
    const children = outEdges.get(nodeId) || [];

    children.forEach(childId => {
      if (!levels.has(childId) || levels.get(childId) < currentLevel + 1) {
        levels.set(childId, currentLevel + 1);
        queue.push(childId);
      }
    });
  }

  // Handle nodes without level (disconnected)
  nodes.forEach(node => {
    if (!levels.has(node.id)) {
      levels.set(node.id, 0);
    }
  });

  // Group nodes by level
  const levelGroups = new Map();
  nodes.forEach(node => {
    const level = levels.get(node.id);
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level).push(node);
  });

  // Calculate positions
  const startX = 2200;
  const startY = 300;
  const horizontalSpacing = 300;
  const verticalSpacing = 200;

  levelGroups.forEach((nodesAtLevel, level) => {
    const levelWidth = nodesAtLevel.length * horizontalSpacing;
    const levelStartX = startX - (levelWidth / 2);

    nodesAtLevel.forEach((node, index) => {
      const x = levelStartX + (index * horizontalSpacing);
      const y = startY + (level * verticalSpacing);
      positions.set(node.id, { x, y, level });
    });
  });

  return positions;
}

/**
 * Creates flowchart shapes from parsed Mermaid data using hierarchical layout
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

  // Delete the loading box and label FIRST to avoid overlap
  if (shapeExists(editor, 'shape:flowchartloadingbox')) {
    console.log('Deleting flowchart loading box and label');
    editor.deleteShapes(['shape:flowchartloadingbox', 'shape:flowchartloadinglabel']);
  }

  // Delete existing flowchart shapes
  const existingFlowchartShapes = editor.getCurrentPageShapes()
    .filter(shape => {
      const id = shape.id.toString();
      return id.includes('flowchart');
    });
  if (existingFlowchartShapes.length > 0) {
    console.log('Deleting existing flowchart shapes:', existingFlowchartShapes.length);
    editor.deleteShapes(existingFlowchartShapes.map(s => s.id));
  }

  // Calculate hierarchical layout
  const nodePositions = calculateHierarchicalLayout(nodes, edges);

  const shapes = [];

  // Create shapes at calculated positions
  nodes.forEach((node) => {
    const pos = nodePositions.get(node.id);
    const shapeConfig = getShapeConfigForNode(node);

    shapes.push({
      type: 'geo',
      x: pos.x,
      y: pos.y,
      props: {
        geo: shapeConfig.geo,
        w: shapeConfig.w,
        h: shapeConfig.h,
        text: node.label || node.id,
        color: shapeConfig.color,
        fill: shapeConfig.fill,
        dash: 'solid',
        size: 'm',
        font: 'sans',
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
  edges.forEach((edge) => {
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

  // Gentler zoom - just zoom out a bit instead of fit
  setTimeout(() => {
    const { x, y, z } = editor.getCamera();
    editor.setCamera({ x, y, z: z * 0.5 }, { animation: { duration: 400 } });
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
