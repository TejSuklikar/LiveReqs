import { createShapeId } from 'tldraw';
import { toRichText } from '@tldraw/editor';

// Helper: Check if a shape with a given ID exists
export const shapeExists = (editor, shapeId) => editor && editor.getShape(shapeId) !== undefined;

// Helper: Zoom out by reducing zoom level
export const zoomOut = (editor) => {
  if (!editor) return;
  const { x, y, z } = editor.getCamera();
  const newZoom = z * 0.85;
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
      {
        id: 'shape:usecasetext',
        type: 'text',
        x: 760,
        y: 260,
        props: {
          text: loadingText,
          size: 'm',
          font: 'sans',
          color: 'black',
          w: 580,
        },
      },
    ]);
  } else {
    // Update the text shape instead of geo
    if (shapeExists(editor, 'shape:usecasetext')) {
      editor.updateShapes([
        {
          id: 'shape:usecasetext',
          type: 'text',
          props: { text: loadingText },
        },
      ]);
    } else {
      // Create text shape if it doesn't exist
      editor.createShapes([
        {
          id: 'shape:usecasetext',
          type: 'text',
          x: 760,
          y: 260,
          props: {
            text: loadingText,
            size: 'm',
            font: 'sans',
            color: 'black',
            w: 580,
          },
        },
      ]);
    }
  }
};

// Update Use Case shape with final text
export const updateUseCaseShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:usecasetext')) {
    editor.updateShapes([
      {
        id: 'shape:usecasetext',
        type: 'text',
        props: {
          text: finalText,
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
      {
        id: 'shape:markdowntext',
        type: 'text',
        x: 1460,
        y: 260,
        props: {
          text: loadingText,
          size: 'm',
          font: 'sans',
          color: 'black',
          w: 580,
        },
      },
    ]);
  } else {
    // Update the text shape instead of geo
    if (shapeExists(editor, 'shape:markdowntext')) {
      editor.updateShapes([
        {
          id: 'shape:markdowntext',
          type: 'text',
          props: { text: loadingText },
        },
      ]);
    } else {
      // Create text shape if it doesn't exist
      editor.createShapes([
        {
          id: 'shape:markdowntext',
          type: 'text',
          x: 1460,
          y: 260,
          props: {
            text: loadingText,
            size: 'm',
            font: 'sans',
            color: 'black',
            w: 580,
          },
        },
      ]);
    }
  }
};

// Update Markdown shape with final text
export const updateMarkdownShape = (editor, finalText) => {
  if (shapeExists(editor, 'shape:markdowntext')) {
    editor.updateShapes([
      {
        id: 'shape:markdowntext',
        type: 'text',
        props: {
          text: finalText,
        },
      },
    ]);
  }
};

// Update description shape
// Note: shape:1 should be a text shape, not a geo shape with text
export const updateDescriptionShape = (editor, text) => {
  // This function is deprecated - shape:1 should not be a geo with text
  // If needed, update a separate text shape instead
  console.warn('updateDescriptionShape: shape:1 should not be updated with text as a geo shape');
};

// Create or update Flowchart loading box
export const createOrUpdateFlowchartLoadingBox = (editor, loadingText) => {
  if (!shapeExists(editor, 'shape:flowchartloadingbox')) {
    editor.createShapes([
      {
        id: 'shape:flowchartloadingbox',
        type: 'geo',
        x: 1450,
        y: 250,
        props: {
          w: 400,
          h: 200,
          geo: 'rectangle',
          color: 'violet',
          fill: 'solid',
          dash: 'solid',
          size: 'm',
        },
      },
      {
        id: 'shape:flowchartloadinglabel',
        type: 'text',
        x: 1450,
        y: 200,
        props: {
          text: 'Flowchart',
          size: 'l',
          font: 'sans',
          color: 'black',
        },
      },
      {
        id: 'shape:flowchartloadingtext',
        type: 'text',
        x: 1500,
        y: 320,
        props: {
          text: loadingText,
          size: 'l',
          font: 'sans',
          color: 'white',
        },
      },
    ]);
  } else {
    // Update the text shape instead of geo
    if (shapeExists(editor, 'shape:flowchartloadingtext')) {
      editor.updateShapes([
        {
          id: 'shape:flowchartloadingtext',
          type: 'text',
          props: { text: loadingText },
        },
      ]);
    } else {
      // Create text shape if it doesn't exist
      editor.createShapes([
        {
          id: 'shape:flowchartloadingtext',
          type: 'text',
          x: 1500,
          y: 320,
          props: {
            text: loadingText,
            size: 'l',
            font: 'sans',
            color: 'white',
          },
        },
      ]);
    }
  }
};

/**
 * ROBUST hierarchical layout that works regardless of Mermaid syntax issues
 * Uses multiple strategies to assign levels correctly
 */
function calculateHierarchicalLayout(nodes, edges) {
  console.log('=== ROBUST LAYOUT CALCULATION START ===');
  console.log('Input nodes:', nodes.length);
  console.log('Input edges:', edges.length);

  const positions = new Map();
  const levels = new Map();
  
  // Build adjacency maps
  const inDegree = new Map();
  const outEdges = new Map();
  
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    outEdges.set(node.id, []);
  });
  
  edges.forEach(edge => {
    if (inDegree.has(edge.to)) {
      inDegree.set(edge.to, inDegree.get(edge.to) + 1);
    }
    if (outEdges.has(edge.from)) {
      outEdges.get(edge.from).push(edge.to);
    }
  });

  // Strategy 1: Try BFS from roots
  const roots = nodes.filter(node => inDegree.get(node.id) === 0);
  console.log('Found', roots.length, 'root nodes:', roots.map(r => r.id));
  
  if (roots.length > 0) {
    // BFS traversal
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
        const newLevel = currentLevel + 1;
        if (!levels.has(childId) || levels.get(childId) < newLevel) {
          levels.set(childId, newLevel);
          if (!queue.includes(childId)) {
            queue.push(childId);
          }
        }
      });
    }
  }

  // Strategy 2: For nodes still without levels, use edge-based assignment
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 100) {
    changed = false;
    iterations++;
    
    edges.forEach(edge => {
      const fromLevel = levels.get(edge.from);
      const toLevel = levels.get(edge.to);
      
      if (fromLevel !== undefined && (toLevel === undefined || toLevel <= fromLevel)) {
        levels.set(edge.to, fromLevel + 1);
        changed = true;
      }
    });
  }

  // Strategy 3: Assign remaining nodes to level 0
  nodes.forEach(node => {
    if (!levels.has(node.id)) {
      console.warn('Node', node.id, 'has no level, assigning to 0');
      levels.set(node.id, 0);
    }
  });

  // Group nodes by level
  const levelGroups = new Map();
  let maxLevel = 0;
  
  nodes.forEach(node => {
    const level = levels.get(node.id);
    maxLevel = Math.max(maxLevel, level);
    
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level).push(node);
  });

  console.log('Max level:', maxLevel);
  console.log('Nodes per level:');
  levelGroups.forEach((nodesAtLevel, level) => {
    console.log(`  Level ${level}: ${nodesAtLevel.length} nodes`);
  });

  // Calculate positions
  const startX = 1450;
  const startY = 250;
  const horizontalSpacing = 300;
  const verticalSpacing = 250;

  // Find max nodes in any level for centering
  let maxNodesInLevel = 0;
  levelGroups.forEach((nodesAtLevel) => {
    maxNodesInLevel = Math.max(maxNodesInLevel, nodesAtLevel.length);
  });

  const maxLevelWidth = maxNodesInLevel * horizontalSpacing;

  levelGroups.forEach((nodesAtLevel, level) => {
    const levelWidth = nodesAtLevel.length * horizontalSpacing;
    const offset = (maxLevelWidth - levelWidth) / 2;
    const levelStartX = startX + offset;

    nodesAtLevel.forEach((node, index) => {
      const x = levelStartX + (index * horizontalSpacing);
      const y = startY + (level * verticalSpacing);
      positions.set(node.id, { x, y, level });
    });
  });

  console.log('=== LAYOUT CALCULATION COMPLETE ===');
  return positions;
}

/**
 * Creates flowchart shapes from parsed Mermaid data
 */
export const createFlowchartShapes = (editor, nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    console.warn('No nodes to render');
    return;
  }

  console.log('=== FLOWCHART RENDERING START ===');

  // Delete loading and markdown boxes
  if (shapeExists(editor, 'shape:flowchartloadingbox')) {
    editor.deleteShapes(['shape:flowchartloadingbox', 'shape:flowchartloadinglabel']);
  }
  if (shapeExists(editor, 'shape:markdownbox')) {
    editor.deleteShapes(['shape:markdownbox', 'shape:markdownlabel']);
  }

  // Delete existing flowchart shapes
  const existingFlowchartShapes = editor.getCurrentPageShapes()
    .filter(shape => shape.id.toString().includes('flowchart'));
  if (existingFlowchartShapes.length > 0) {
    editor.deleteShapes(existingFlowchartShapes.map(s => s.id));
  }

  // Calculate layout
  const nodePositions = calculateHierarchicalLayout(nodes, edges);

  // Create node shapes using custom flowNode shape
  const shapes = [];
  nodes.forEach((node) => {
    const pos = nodePositions.get(node.id);
    const shapeConfig = getShapeConfigForNode(node);

    shapes.push({
      type: 'flowNode',
      x: pos.x,
      y: pos.y,
      props: {
        variant: shapeConfig.geo,
        w: shapeConfig.w,
        h: shapeConfig.h,
        richText: toRichText(node.label || node.id),
        color: shapeConfig.color,
        fill: shapeConfig.fill,
        dash: 'solid',
        size: 'm',
        font: 'sans',
      },
    });
  });

  editor.createShapes(shapes);

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
    editor.createShapes(arrowShapes);
  }

  // Zoom out
  setTimeout(() => {
    const { x, y, z } = editor.getCamera();
    editor.setCamera({ x, y, z: z * 0.5 }, { animation: { duration: 400 } });
  }, 100);

  console.log('=== FLOWCHART RENDERING COMPLETE ===');
};

function getShapeConfigForNode(node) {
  switch (node.type) {
    case 'ellipse':
      return { geo: 'ellipse', w: 220, h: 140, color: 'green', fill: 'solid' };
    case 'diamond':
      return { geo: 'diamond', w: 200, h: 200, color: 'red', fill: 'none' };
    case 'rectangle':
    default:
      return { geo: 'rectangle', w: 240, h: 140, color: 'blue', fill: 'none' };
  }
}