import React from 'react';
import { MenuItem } from '@tldraw/tldraw';
import { saveAs } from 'file-saver';

export function CustomMenus({ app }) {
  const handleOpen = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tldr';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          let snapshot = JSON.parse(content);

          if (app && app.store) {
            await app.store.loadSnapshot(snapshot);
            app.zoomToFit();
            app.updateViewport();
            console.log('File loaded successfully');
          }
        } catch (error) {
          console.error('Error loading snapshot:', error);
          alert(`An error occurred while loading the file: ${error.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = async () => {
    if (app) {
      try {
        let serializedData = app.store.serialize();
        if (!serializedData.schemaVersion) {
          serializedData.schemaVersion = 2;
        }

        const wrappedData = {
          store: serializedData,
          schema: {
            schemaVersion: serializedData.schemaVersion,
            sequences: serializedData.sequences,
          },
        };

        const blob = new Blob([JSON.stringify(wrappedData, null, 2)], { type: 'application/json' });
        saveAs(blob, 'usecase.tldr');
      } catch (error) {
        console.error('Error saving the file:', error);
        alert(`An error occurred while saving the file: ${error.message}`);
      }
    }
  };

  return (
    <>
      <MenuItem
        title="Open"
        shortcut="⌘O"
        onSelect={handleOpen}
      />
      <MenuItem
        title="Save"
        shortcut="⌘S"
        onSelect={handleSave}
      />
    </>
  );
}
