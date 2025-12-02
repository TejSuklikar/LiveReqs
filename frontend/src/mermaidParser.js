/**
 * Parses Mermaid flowchart syntax into structured data
 * @param {string} mermaidText - Mermaid "graph TD" syntax
 * @returns {Object} { nodes: [], edges: [] }
 */
export function parseMermaid(mermaidText) {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map(); // Track seen nodes

  try {
    // Remove code fences if present
    let cleanText = mermaidText.trim();
    cleanText = cleanText.replace(/```mermaid\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');

    // Split into lines
    const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'));

    for (const line of lines) {
      // Skip graph declaration
      if (line.startsWith('graph ')) continue;

      // Parse edges (must do this first before node extraction)
      // Match: NodeA -->|Label| NodeB or NodeA --> NodeB or NodeA -.-> NodeB
      const edgeMatch = line.match(/(\w+)\s*(-->|-.->)\s*(?:\|([^|]+)\|)?\s*(\w+)/);
      if (edgeMatch) {
        const [, fromId, arrowType, label, toId] = edgeMatch;
        edges.push({
          from: fromId,
          to: toId,
          label: label ? label.trim() : '',
          style: arrowType === '-->' ? 'solid' : 'dotted'
        });

        // Extract nodes from edge definition
        const fromNode = extractNodeFromLine(line, fromId);
        const toNode = extractNodeFromLine(line, toId);

        if (fromNode && !nodeMap.has(fromId)) {
          nodes.push(fromNode);
          nodeMap.set(fromId, true);
        }
        if (toNode && !nodeMap.has(toId)) {
          nodes.push(toNode);
          nodeMap.set(toId, true);
        }
        continue;
      }

      // Parse standalone node definitions
      const nodeMatch = line.match(/(\w+)([\[\(\{])([^\]\)\}]+)([\]\)\}])/);
      if (nodeMatch) {
        const [, id, openBracket, label] = nodeMatch;
        if (!nodeMap.has(id)) {
          const type = getNodeType(openBracket);
          nodes.push({ id, label: label.trim(), type });
          nodeMap.set(id, true);
        }
      }
    }

    console.log('Parsed Mermaid:', { nodes, edges });
    return { nodes, edges };

  } catch (error) {
    console.error('Mermaid parsing error:', error);
    return { nodes: [], edges: [] };
  }
}

/**
 * Extract node definition from a line
 */
function extractNodeFromLine(line, nodeId) {
  // Match: NodeId[Label], NodeId(Label), or NodeId{Label}
  const pattern = new RegExp(`${nodeId}([\\[\\(\\{])([^\\]\\)\\}]+)([\\]\\)\\}])`);
  const match = line.match(pattern);

  if (match) {
    const [, openBracket, label] = match;
    const type = getNodeType(openBracket);
    return { id: nodeId, label: label.trim(), type };
  }

  // If no bracket notation, just use nodeId as label
  return { id: nodeId, label: nodeId, type: 'rectangle' };
}

/**
 * Determine node type from bracket style
 */
function getNodeType(bracket) {
  switch (bracket) {
    case '[': return 'rectangle';
    case '(': return 'ellipse';
    case '{': return 'diamond';
    default: return 'rectangle';
  }
}
