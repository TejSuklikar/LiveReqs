import React from 'react';
import { Tldraw } from '@tldraw/tldraw';

export default function TldrawCanvas({ editor, setEditor, description, setDescription }) {

  // Called once the Tldraw editor is mounted
  const onMount = (editorInstance) => {
    setEditor(editorInstance);

    // Create initial shapes on the Tldraw canvas
    // Note: This file appears to be unused, but keeping it for reference
    editorInstance.createShapes([
      {
        id: 'shape:1',
        type: 'geo',
        x: 50,
        y: 250,
        props: {
          w: 600,
          h: 400,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
        },
      },
      {
        id: 'shape:1text',
        type: 'text',
        x: 60,
        y: 260,
        props: {
          text: '',
          size: 'm',
          font: 'draw',
          color: 'black',
          w: 580,
        },
      },
      {
        id: 'shape:2',
        type: 'text',
        x: 50,
        y: 200,
        props: {
          text: 'Description',
          size: 'l',
          font: 'draw',
          color: 'black',
        },
      },
    ]);

    // Listen for shape changes to track changes to shape #1's text
    const updateDescription = () => {
      const descriptionShape = editorInstance.getShape('shape:1');
      if (descriptionShape && descriptionShape.props.text !== undefined) {
        console.log('Description updated:', descriptionShape.props.text);
        setDescription(descriptionShape.props.text);
      }
    };

    // Listen to store changes for more reliable updates
    editorInstance.store.listen(
      (entry) => {
        if (entry.changes.updated && entry.changes.updated['shape:1']) {
          updateDescription();
        }
      },
      { source: 'user', scope: 'document' }
    );

    // Also update on any change event as backup
    editorInstance.on('change', updateDescription);
  };

  // Allow loading a .tldr file to restore a saved canvas
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (editor && editor.store) {
            editor.store.loadSnapshot(json);
          }
        } catch (error) {
          console.error('Error parsing file:', error);
          alert('Error parsing file. Please ensure the file is valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Tldraw onMount={onMount} />
      {/* Hidden file input for opening .tldr files */}
      <input
        type="file"
        id="fileInput"
        accept=".tldr"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
