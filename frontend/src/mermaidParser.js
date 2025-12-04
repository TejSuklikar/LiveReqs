/**
 * Parses Mermaid flowchart syntax into structured data with proper hierarchy
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

    console.log('=== MERMAID PARSER DEBUG ===');
    console.log('Total lines:', lines.length);

    for (const line of lines) {
      // Skip graph declaration
      if (line.startsWith('graph ')) {
        console.log('Skipping graph declaration:', line);
        continue;
      }

      // Parse edges FIRST (this is critical for hierarchy)
      // Match patterns like:
      // NodeA --> NodeB
      // NodeA -->|Label| NodeB
      // NodeA -.-> NodeB
      // NodeA -.->|Label| NodeB
      const edgeMatch = line.match(/(\w+)\s*(-->|-.->)\s*(?:\|([^|]+)\|)?\s*(\w+)/);
      if (edgeMatch) {
        const [, fromId, arrowType, label, toId] = edgeMatch;
        
        console.log('Found edge:', { from: fromId, to: toId, type: arrowType, label: label || '' });
        
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
          console.log('Adding node from edge:', fromNode);
          nodes.push(fromNode);
          nodeMap.set(fromId, true);
        }
        if (toNode && !nodeMap.has(toId)) {
          console.log('Adding node from edge:', toNode);
          nodes.push(toNode);
          nodeMap.set(toId, true);
        }
        continue;
      }

      // Parse standalone node definitions (nodes without connections in that line)
      const nodeMatch = line.match(/(\w+)([\[\(\{])([^\]\)\}]+)([\]\)\}])/);
      if (nodeMatch) {
        const [, id, openBracket, label] = nodeMatch;
        if (!nodeMap.has(id)) {
          const type = getNodeType(openBracket);
          const node = { id, label: label.trim(), type };
          console.log('Adding standalone node:', node);
          nodes.push(node);
          nodeMap.set(id, true);
        }
      }
    }

    console.log('=== PARSING COMPLETE ===');
    console.log('Total nodes:', nodes.length);
    console.log('Total edges:', edges.length);
    console.log('Nodes:', nodes);
    console.log('Edges:', edges);

    // CRITICAL FIX: Normalize node references
    // Sometimes Claude generates 'Start' as a node but references 'Step1' in edges
    const nodeIds = new Set(nodes.map(n => n.id));
    const missingNodeIds = new Set();
    
    // Check for missing nodes and common naming mismatches
    edges.forEach(edge => {
      if (!nodeIds.has(edge.from)) {
        missingNodeIds.add(edge.from);
      }
      if (!nodeIds.has(edge.to)) {
        missingNodeIds.add(edge.to);
      }
    });

    if (missingNodeIds.size > 0) {
      console.warn('Found missing nodes referenced in edges:', Array.from(missingNodeIds));
      
      // Check if this is a Start/Step1 mismatch
      if (missingNodeIds.has('Step1') && nodeIds.has('Start')) {
        console.log('Detected Start/Step1 mismatch - normalizing edges to use "Start"');
        edges.forEach(edge => {
          if (edge.from === 'Step1') edge.from = 'Start';
          if (edge.to === 'Step1') edge.to = 'Start';
        });
        missingNodeIds.delete('Step1');
      }
      
      // Add any remaining missing nodes
      missingNodeIds.forEach(id => {
        console.log('Adding missing node:', id);
        nodes.push({ id, label: id, type: 'rectangle' });
      });
      
      console.log('Fixed nodes. New total:', nodes.length);
    }

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

  // If no bracket notation found in this line, return null
  // The node might be defined elsewhere or is just a reference
  return null;
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