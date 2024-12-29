import React from 'react';
import { Tldraw } from '@tldraw/tldraw';

export default function TldrawCanvas({ editor, setEditor, description, setDescription }) {

  // Called once the Tldraw editor is mounted
  const onMount = (editorInstance) => {
    setEditor(editorInstance);

    // Create initial shapes on the Tldraw canvas
    editorInstance.createShapes([
      {
        id: 'shape:1',
        type: 'geo',
        x: 100,
        y: 100,
        props: {
          w: 600,
          h: 200,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: 'Type here...',
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:2',
        type: 'text',
        x: 100,
        y: 50,
        props: {
          text: 'Description',
          size: 'l',
          font: 'draw',
          color: 'black',
        },
      },
    ]);

    // Listen for updates to the editor—so we can track changes to shape #1's text
    editorInstance.on('update', () => {
      const descriptionShape = editorInstance.getShape('shape:1');
      if (descriptionShape) {
        setDescription(descriptionShape.props.text);
      }
    });
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
