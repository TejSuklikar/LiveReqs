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

  // Delete existing flowchart shapes
  const existingFlowchartShapes = editor.getCurrentPageShapes()
    .filter(shape => shape.id.startsWith('flowchart:'));
  if (existingFlowchartShapes.length > 0) {
    editor.deleteShapes(existingFlowchartShapes.map(s => s.id));
  }

  // Layout configuration - improved spacing
  const config = {
    startX: 2200,
    startY: 250,
    verticalSpacing: 200,   // Vertical padding between layers
    horizontalSpacing: 250, // Horizontal padding between nodes
    mainFlowX: 2200,        // X position for main flow (centered)
    alternateFlowOffsetX: 350, // Additional offset for alternate flows to the right
    diamondExtraSpace: 50,  // Extra space for diamond shapes
  };

  // Build graph structure
  const graph = buildGraph(nodes, edges);

  // Identify main flow and alternate flows
  const { mainFlow, alternateFlows } = identifyFlowPaths(graph, edges, nodes);

  // Assign layers using hierarchical layout
  const layers = assignHierarchicalLayers(graph, nodes, edges, mainFlow, alternateFlows);

  // Position nodes with collision detection
  const { nodePositions, shapes } = positionNodesWithCollisionDetection(
    nodes,
    layers,
    edges,
    config,
    mainFlow,
    alternateFlows
  );

  // Create shapes first
  editor.createShapes(shapes);

  // Create arrows with proper binding
  const arrowShapes = createArrows(edges, nodePositions, shapes, editor);

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
  nodes.forEach(node => graph.set(node.id, { children: [], parents: [] }));
  edges.forEach(edge => {
    if (graph.has(edge.from) && graph.has(edge.to)) {
      graph.get(edge.from).children.push(edge.to);
      graph.get(edge.to).parents.push(edge.from);
    }
  });
  return graph;
}

/**
 * Identify main flow and alternate flows
 * Main flow: primary path from start to end
 * Alternate flows: branches and error paths (usually with dotted lines or specific labels)
 */
function identifyFlowPaths(graph, edges, nodes) {
  const mainFlow = new Set();
  const alternateFlows = new Set();

  if (nodes.length === 0) return { mainFlow, alternateFlows };

  // Start with first node
  const startNode = nodes[0].id;
  mainFlow.add(startNode);

  // BFS to identify main path (follow non-dotted edges first)
  const queue = [startNode];
  const visited = new Set([startNode]);

  while (queue.length > 0) {
    const current = queue.shift();
    const node = graph.get(current);

    if (!node) continue;

    // Find edges from current node
    const outgoingEdges = edges.filter(e => e.from === current);

    // Prioritize solid edges (main flow) over dotted edges (alternate flow)
    const solidEdges = outgoingEdges.filter(e => e.style !== 'dotted');
    const dottedEdges = outgoingEdges.filter(e => e.style === 'dotted');

    // Main flow follows solid edges
    solidEdges.forEach(edge => {
      if (!visited.has(edge.to)) {
        mainFlow.add(edge.to);
        visited.add(edge.to);
        queue.push(edge.to);
      }
    });

    // Alternate flows are dotted edges
    dottedEdges.forEach(edge => {
      alternateFlows.add(edge.to);
      // Follow alternate flow to mark all nodes in that path
      const altQueue = [edge.to];
      const altVisited = new Set([edge.to]);
      while (altQueue.length > 0) {
        const altCurrent = altQueue.shift();
        const altNode = graph.get(altCurrent);
        if (!altNode) continue;

        const altEdges = edges.filter(e => e.from === altCurrent && !mainFlow.has(e.to));
        altEdges.forEach(e => {
          if (!altVisited.has(e.to) && !mainFlow.has(e.to)) {
            alternateFlows.add(e.to);
            altVisited.add(e.to);
            altQueue.push(e.to);
          }
        });
      }
    });
  }

  return { mainFlow, alternateFlows };
}

/**
 * Assign layers using hierarchical layout (Sugiyama-style)
 * Nodes are assigned to layers based on their depth in the graph
 */
function assignHierarchicalLayers(graph, nodes, edges, mainFlow, alternateFlows) {
  const layers = new Map();
  const inDegree = new Map();

  // Initialize in-degree for each node
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    layers.set(node.id, 0);
  });

  // Calculate in-degree
  edges.forEach(edge => {
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
  });

  // Topological sort with layer assignment
  const queue = [];
  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node.id);
      layers.set(node.id, 0);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift();
    const currentLayer = layers.get(current);
    const node = graph.get(current);

    if (!node) continue;

    node.children.forEach(childId => {
      const childInDegree = inDegree.get(childId) - 1;
      inDegree.set(childId, childInDegree);

      // Update layer to be one more than parent's layer
      const newLayer = currentLayer + 1;
      if (newLayer > (layers.get(childId) || 0)) {
        layers.set(childId, newLayer);
      }

      if (childInDegree === 0) {
        queue.push(childId);
      }
    });
  }

  return layers;
}

/**
 * Position nodes with collision detection and proper spacing
 */
function positionNodesWithCollisionDetection(nodes, layers, edges, config, mainFlow, alternateFlows) {
  const nodePositions = new Map();
  const shapes = [];
  const occupiedRegions = []; // Track occupied regions for collision detection

  // Group nodes by layer
  const layerGroups = {};
  nodes.forEach(node => {
    const layer = layers.get(node.id) || 0;
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(node);
  });

  // Sort layers
  const sortedLayers = Object.keys(layerGroups).sort((a, b) => Number(a) - Number(b));

  let currentY = config.startY;

  sortedLayers.forEach(layerIndex => {
    const nodesInLayer = layerGroups[layerIndex];

    // Separate main flow and alternate flow nodes
    const mainFlowNodes = nodesInLayer.filter(n => mainFlow.has(n.id));
    const alternateFlowNodes = nodesInLayer.filter(n => alternateFlows.has(n.id));

    // Calculate positions for main flow (centered)
    let currentX = config.mainFlowX;

    // Position main flow nodes first
    mainFlowNodes.forEach(node => {
      const shapeConfig = getShapeConfig(node);
      const pos = findNonCollidingPosition(
        currentX,
        currentY,
        shapeConfig.w,
        shapeConfig.h,
        occupiedRegions,
        config
      );

      nodePositions.set(node.id, pos);

      shapes.push({
        id: createShapeId(`flowchart:${node.id}`),
        type: 'geo',
        x: pos.x,
        y: pos.y,
        props: {
          geo: shapeConfig.geo,
          w: shapeConfig.w,
          h: shapeConfig.h,
          text: node.label,
          color: shapeConfig.color,
          fill: shapeConfig.fill,
          dash: 'solid',
          size: 'm',
          font: 'sans',
          align: 'middle',
          verticalAlign: 'middle',
        },
      });

      // Mark region as occupied
      occupiedRegions.push({
        x: pos.x,
        y: pos.y,
        w: shapeConfig.w,
        h: shapeConfig.h,
      });

      currentX += shapeConfig.w + config.horizontalSpacing;
    });

    // Position alternate flow nodes to the right
    currentX = config.mainFlowX + config.alternateFlowOffsetX;

    alternateFlowNodes.forEach(node => {
      const shapeConfig = getShapeConfig(node);
      const pos = findNonCollidingPosition(
        currentX,
        currentY,
        shapeConfig.w,
        shapeConfig.h,
        occupiedRegions,
        config
      );

      nodePositions.set(node.id, pos);

      shapes.push({
        id: createShapeId(`flowchart:${node.id}`),
        type: 'geo',
        x: pos.x,
        y: pos.y,
        props: {
          geo: shapeConfig.geo,
          w: shapeConfig.w,
          h: shapeConfig.h,
          text: node.label,
          color: shapeConfig.color,
          fill: shapeConfig.fill,
          dash: 'solid',
          size: 'm',
          font: 'sans',
          align: 'middle',
          verticalAlign: 'middle',
        },
      });

      // Mark region as occupied
      occupiedRegions.push({
        x: pos.x,
        y: pos.y,
        w: shapeConfig.w,
        h: shapeConfig.h,
      });

      currentX += shapeConfig.w + config.horizontalSpacing;
    });

    // Move to next layer
    const maxHeightInLayer = Math.max(
      ...nodesInLayer.map(n => getShapeConfig(n).h)
    );
    currentY += maxHeightInLayer + config.verticalSpacing;
  });

  return { nodePositions, shapes };
}

/**
 * Find a non-colliding position for a shape
 */
function findNonCollidingPosition(x, y, w, h, occupiedRegions, config) {
  let testX = x;
  let testY = y;
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    const collides = occupiedRegions.some(region => {
      return !(
        testX + w + 10 < region.x || // Add 10px padding
        testX > region.x + region.w + 10 ||
        testY + h + 10 < region.y ||
        testY > region.y + region.h + 10
      );
    });

    if (!collides) {
      return { x: testX, y: testY };
    }

    // Try moving right
    testX += config.horizontalSpacing / 2;
    attempts++;

    // If we've tried moving right too many times, move down
    if (attempts > maxAttempts / 2) {
      testX = x;
      testY += config.verticalSpacing / 2;
    }
  }

  // If we still can't find a spot, just return the original position
  return { x, y };
}

/**
 * Create arrows connecting nodes
 */
function createArrows(edges, nodePositions, shapes, editor) {
  const arrowShapes = [];

  edges.forEach((edge, index) => {
    const fromPos = nodePositions.get(edge.from);
    const toPos = nodePositions.get(edge.to);

    if (fromPos && toPos) {
      const fromShape = shapes.find(s => s.id.includes(`flowchart:${edge.from}`));
      const toShape = shapes.find(s => s.id.includes(`flowchart:${edge.to}`));

      if (fromShape && toShape) {
        // Calculate arrow endpoints
        const fromCenterX = fromPos.x + fromShape.props.w / 2;
        const fromCenterY = fromPos.y + fromShape.props.h / 2;
        const toCenterX = toPos.x + toShape.props.w / 2;
        const toCenterY = toPos.y + toShape.props.h / 2;

        // Determine connection points based on relative positions
        let startX, startY, endX, endY;

        if (Math.abs(toPos.y - fromPos.y) > Math.abs(toPos.x - fromPos.x)) {
          // Vertical connection (top/bottom)
          if (toPos.y > fromPos.y) {
            // Connect bottom to top
            startX = fromCenterX;
            startY = fromPos.y + fromShape.props.h;
            endX = toCenterX;
            endY = toPos.y;
          } else {
            // Connect top to bottom
            startX = fromCenterX;
            startY = fromPos.y;
            endX = toCenterX;
            endY = toPos.y + toShape.props.h;
          }
        } else {
          // Horizontal connection (left/right)
          if (toPos.x > fromPos.x) {
            // Connect right to left
            startX = fromPos.x + fromShape.props.w;
            startY = fromCenterY;
            endX = toPos.x;
            endY = toCenterY;
          } else {
            // Connect left to right
            startX = fromPos.x;
            startY = fromCenterY;
            endX = toPos.x + toShape.props.w;
            endY = toCenterY;
          }
        }

        arrowShapes.push({
          id: createShapeId(`flowchart:arrow:${index}`),
          type: 'arrow',
          props: {
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            color: edge.style === 'dotted' ? 'red' : 'black',
            dash: edge.style === 'dotted' ? 'dashed' : 'solid',
            size: 'm',
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
            y: midY - 15,
            props: {
              text: edge.label,
              size: 's',
              color: 'red',
              font: 'sans',
            },
          });
        }
      }
    }
  });

  return arrowShapes;
}

/**
 * Get shape configuration based on node type
 */
function getShapeConfig(node) {
  switch (node.type) {
    case 'ellipse':
      return {
        geo: 'ellipse',
        w: 200,
        h: 120,
        color: 'green',
        fill: 'solid',
      };
    case 'diamond':
      return {
        geo: 'diamond',
        w: 220, // Larger for better readability
        h: 220,
        color: 'red',
        fill: 'none',
      };
    case 'rectangle':
    default:
      return {
        geo: 'rectangle',
        w: 220,
        h: 100,
        color: 'blue',
        fill: 'none',
      };
  }
}
