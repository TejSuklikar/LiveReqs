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
 * Creates flowchart shapes from parsed Mermaid data
 * @param {Editor} editor - TLDraw editor instance
 * @param {Array} nodes - Parsed nodes from mermaidParser
 * @param {Array} edges - Parsed edges from mermaidParser
 */
export const createFlowchartShapes = (editor, nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    console.warn('No nodes to render');
    return;
  }

  // Delete existing flowchart shapes
  const existingFlowchartShapes = editor.getCurrentPageShapes()
    .filter(shape => shape.id.startsWith('flowchart:'));
  if (existingFlowchartShapes.length > 0) {
    editor.deleteShapes(existingFlowchartShapes.map(s => s.id));
  }

  const nodePositions = new Map();
  const shapes = [];

  // Layout configuration
  const startX = 1500;
  const startY = 200;
  const verticalSpacing = 180;
  const horizontalSpacing = 350;

  // Simple top-to-bottom layout
  // Build a graph to understand flow
  const graph = buildGraph(nodes, edges);
  const levels = assignLevels(graph, nodes[0]?.id);

  // Position nodes by level
  let currentY = startY;
  const levelGroups = groupByLevel(nodes, levels);

  Object.keys(levelGroups).sort((a, b) => Number(a) - Number(b)).forEach(level => {
    const nodesInLevel = levelGroups[level];
    const levelWidth = (nodesInLevel.length - 1) * horizontalSpacing;
    let currentX = startX - (levelWidth / 2);

    nodesInLevel.forEach(node => {
      nodePositions.set(node.id, { x: currentX, y: currentY });

      // Create shape based on node type
      const shapeConfig = getShapeConfig(node);
      shapes.push({
        id: createShapeId(`flowchart:${node.id}`),
        type: 'geo',
        x: currentX,
        y: currentY,
        props: {
          geo: shapeConfig.geo,
          w: shapeConfig.w,
          h: shapeConfig.h,
          text: node.label,
          color: shapeConfig.color,
          fill: shapeConfig.fill,
          dash: 'draw',
          size: 'm',
          font: 'draw',
          align: 'middle',
          verticalAlign: 'middle',
        },
      });

      currentX += horizontalSpacing;
    });

    currentY += verticalSpacing;
  });

  // Create shapes first
  editor.createShapes(shapes);

  // Then create arrows
  const arrowShapes = [];
  edges.forEach((edge, index) => {
    const fromPos = nodePositions.get(edge.from);
    const toPos = nodePositions.get(edge.to);

    if (fromPos && toPos) {
      const fromShape = shapes.find(s => s.id.includes(edge.from));
      const toShape = shapes.find(s => s.id.includes(edge.to));

      if (fromShape && toShape) {
        // Calculate arrow endpoints (bottom of from, top of to)
        const startX = fromPos.x + fromShape.props.w / 2;
        const startY = fromPos.y + fromShape.props.h;
        const endX = toPos.x + toShape.props.w / 2;
        const endY = toPos.y;

        arrowShapes.push({
          id: createShapeId(`flowchart:arrow:${index}`),
          type: 'arrow',
          props: {
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            color: edge.style === 'dotted' ? 'red' : 'black',
            dash: edge.style === 'dotted' ? 'dashed' : 'draw',
          },
        });

        // Add edge label if present
        if (edge.label) {
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          arrowShapes.push({
            id: createShapeId(`flowchart:label:${index}`),
            type: 'text',
            x: midX - 30,
            y: midY - 10,
            props: {
              text: edge.label,
              size: 's',
              color: 'red',
            },
          });
        }
      }
    }
  });

  if (arrowShapes.length > 0) {
    editor.createShapes(arrowShapes);
  }

  // Zoom to fit flowchart
  zoomOut(editor);
};

/**
 * Build adjacency graph from edges
 */
function buildGraph(nodes, edges) {
  const graph = new Map();
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    if (graph.has(edge.from)) {
      graph.get(edge.from).push(edge.to);
    }
  });
  return graph;
}

/**
 * Assign level (depth) to each node using BFS
 */
function assignLevels(graph, startNodeId) {
  const levels = new Map();
  const queue = [[startNodeId, 0]];
  const visited = new Set();

  while (queue.length > 0) {
    const [nodeId, level] = queue.shift();

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    levels.set(nodeId, level);

    const neighbors = graph.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        queue.push([neighbor, level + 1]);
      }
    });
  }

  return levels;
}

/**
 * Group nodes by their level
 */
function groupByLevel(nodes, levels) {
  const groups = {};
  nodes.forEach(node => {
    const level = levels.get(node.id) || 0;
    if (!groups[level]) groups[level] = [];
    groups[level].push(node);
  });
  return groups;
}

/**
 * Get shape configuration based on node type
 */
function getShapeConfig(node) {
  switch (node.type) {
    case 'ellipse':
      return {
        geo: 'ellipse',
        w: 180,
        h: 100,
        color: 'green',
        fill: 'solid',
      };
    case 'diamond':
      return {
        geo: 'diamond',
        w: 160,
        h: 160,
        color: 'red',
        fill: 'none',
      };
    case 'rectangle':
    default:
      return {
        geo: 'rectangle',
        w: 200,
        h: 100,
        color: 'blue',
        fill: 'none',
      };
  }
}
