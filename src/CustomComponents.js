import React from 'react';
import {
  DefaultActionsMenu,
  DefaultActionsMenuContent,
  DefaultContextMenu,
  DefaultContextMenuContent,
  DefaultDebugMenu,
  DefaultDebugMenuContent,
  DefaultHelpMenu,
  DefaultHelpMenuContent,
  DefaultKeyboardShortcutsDialog,
  DefaultKeyboardShortcutsDialogContent,
  DefaultMainMenu,
  DefaultMainMenuContent,
  DefaultPageMenu,
  DefaultQuickActions,
  DefaultQuickActionsContent,
  DefaultStylePanel,
  DefaultStylePanelContent,
  DefaultToolbar,
  DefaultToolbarContent,
  DefaultZoomMenu,
  DefaultZoomMenuContent,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  useEditor,
  useRelevantStyles,
} from '@tldraw/tldraw';

function useFileOperations() {
  const editor = useEditor(); // Get the current Tldraw editor instance

  const handleSave = async () => {
    if (editor) {
      try {
        // Serialize the current editor state into a snapshot object
        let serializedData = editor.store.serialize();
  
        // Normalize the serialized data to ensure essential records and schema are present
        const normalizedData = {
          store: serializedData.store || serializedData,
          schema: {
            schemaVersion: serializedData.schemaVersion || 2, // Default schema version
            sequences: serializedData.sequences || [],
            recordVersions: serializedData.recordVersions || {
              asset: { version: 1, subTypeKey: 'type', subTypeVersions: {} },
              camera: { version: 1 },
              document: { version: 2 },
              instance: { version: 21 },
              page: { version: 1 },
              shape: { version: 3, subTypeKey: 'type', subTypeVersions: {} },
              instance_page_state: { version: 5 },
              pointer: { version: 1 },
            }
          }
        };
  
        // Ensure that the document record exists, or create it if missing
        if (!normalizedData.store['document:document']) {
          normalizedData.store['document:document'] = {
            id: 'document:document',
            typeName: 'document',
            gridSize: 10,
          };
        }
  
        // Ensure that the page record exists, or create it if missing
        if (!normalizedData.store['page:page']) {
          normalizedData.store['page:page'] = {
            id: 'page:page',
            typeName: 'page',
            name: 'Page 1',
            index: 'a1',
          };
        }
  
        // Convert the normalized data into a JSON string for saving
        const fileContent = JSON.stringify(normalizedData, null, 2);
  
        // Prompt the user to select a file location for saving the .tldr file
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: 'usecase.tldr',
          types: [{
            description: 'TLDraw Files',
            accept: { 'application/json': ['.tldr'] },
          }],
        });
  
        // Write the content to the selected file
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(fileContent);
        await writableStream.close();
  
        console.log('File saved successfully'); // Log success message
      } catch (error) {
        console.error('Error saving the file:', error); // Log any errors during the save process
      }
    } else {
      console.error('Editor is not initialized'); // Log error if the editor is not initialized
    }
  };

  function normalizeSnapshot(snapshot) {
    // Ensure the store object exists in the snapshot, create an empty object if missing
    if (!snapshot.store) {
        snapshot.store = {};
    }

    // Ensure the schema object exists in the snapshot, set a default schema version if missing
    if (!snapshot.schema) {
        snapshot.schema = { schemaVersion: 2 };
    }
    
    // Ensure the document record exists in the store, create it with default values if missing
    if (!snapshot.store['document:document']) {
        snapshot.store['document:document'] = {
            id: 'document:document',
            typeName: 'document',
            gridSize: 10, // Default grid size
            name: '' // Default name (empty string)
        };
    }

    // Ensure the page record exists in the store, create it with default values if missing
    if (!snapshot.store['page:page']) {
        snapshot.store['page:page'] = {
            id: 'page:page',
            typeName: 'page',
            name: 'Page 1', // Default page name
            index: 'a1' // Default page index
        };
    }

    // List of valid type names that should be present in the store
    const validTypes = ['document', 'page', 'shape', 'asset', 'camera', 'instance', 'pointer'];

    // Iterate over each item in the store
    for (const [key, value] of Object.entries(snapshot.store)) {
        // If the typeName is missing or not valid, infer it from the key or remove the item
        if (!value.typeName || !validTypes.includes(value.typeName)) {
            const inferredType = key.split(':')[0]; // Infer the type from the key prefix
            if (validTypes.includes(inferredType)) {
                value.typeName = inferredType; // Assign the inferred typeName
            } else {
                delete snapshot.store[key]; // Remove the item if typeName is invalid
            }
        }
    }

    return snapshot; // Return the normalized snapshot
}

  const handleOpen = async () => {
    // Create a hidden input element to allow file selection
    const input = document.createElement('input');
    input.type = 'file'; // Set the input type to file
    input.accept = '.tldr'; // Only accept files with the .tldr extension

    // Set up an event listener for when a file is selected
    input.onchange = async (e) => {
        const file = e.target.files[0]; // Get the selected file
        if (!file) return; // If no file was selected, exit the function

        const reader = new FileReader(); // Create a new FileReader to read the file

        // Set up an event listener for when the file is read
        reader.onload = async (event) => {
            try {
                const content = event.target.result; // Get the file content as a string
                let snapshot = JSON.parse(content); // Parse the content into a JSON object

                // Normalize the snapshot before loading
                snapshot = normalizeSnapshot(snapshot);

                // If the editor is initialized, load the snapshot into it
                if (editor && editor.store) {
                    editor.store.loadSnapshot(snapshot);
                } else {
                    console.error('Editor is not initialized'); // Log an error if the editor is not ready
                }
            } catch (error) {
                console.error('Error loading snapshot:', error); // Log any errors that occur during file loading
            }
        };
        reader.readAsText(file); // Read the file as a text string
    };
    input.click(); // Trigger the file input dialog
};

  return { handleSave, handleOpen };
}


function CustomActionsMenu() {
  // Retrieve the file operation methods (handleSave and handleOpen) using the custom hook
  const { handleSave, handleOpen } = useFileOperations();

  return (
    <DefaultActionsMenu>
      {/* Menu item for saving the current state */}
      <TldrawUiMenuItem
        id="save"
        label="Save"
        icon="file"
        readonlyOk
        onSelect={handleSave} // Trigger handleSave when this item is selected
      />
      {/* Menu item for opening a previously saved state */}
      <TldrawUiMenuItem
        id="open"
        label="Open"
        icon="folder"
        readonlyOk
        onSelect={handleOpen} // Trigger handleOpen when this item is selected
      />
      <DefaultActionsMenuContent /> {/* Default content for the actions menu */}
    </DefaultActionsMenu>
  );
}

function CustomContextMenu(props) {
  // Retrieve the file operation methods (handleSave and handleOpen) using the custom hook
  const { handleSave, handleOpen } = useFileOperations();

  return (
    <DefaultContextMenu {...props}>
      <TldrawUiMenuGroup id="file-operations">
        {/* Context menu item for saving the current state */}
        <TldrawUiMenuItem
          id="save"
          label="Save"
          icon="file"
          readonlyOk
          onSelect={handleSave} // Trigger handleSave when this item is selected
        />
        {/* Context menu item for opening a previously saved state */}
        <TldrawUiMenuItem
          id="open"
          label="Open"
          icon="folder"
          readonlyOk
          onSelect={handleOpen} // Trigger handleOpen when this item is selected
        />
      </TldrawUiMenuGroup>
      <DefaultContextMenuContent /> {/* Default content for the context menu */}
    </DefaultContextMenu>
  );
}

function CustomDebugMenu() {
  return (
    <DefaultDebugMenu>
      {/* Renders the default debug menu content */}
      <DefaultDebugMenuContent />
    </DefaultDebugMenu>
  );
}

function CustomHelpMenu() {
  return (
    <DefaultHelpMenu>
      {/* Renders the default help menu content */}
      <DefaultHelpMenuContent />
    </DefaultHelpMenu>
  );
}

function CustomKeyboardShortcutsDialog(props) {
  return (
    <DefaultKeyboardShortcutsDialog {...props}>
      {/* Renders the default content for the keyboard shortcuts dialog */}
      <DefaultKeyboardShortcutsDialogContent />
    </DefaultKeyboardShortcutsDialog>
  );
}

function CustomMainMenu() {
  // Extract handleSave and handleOpen functions from useFileOperations
  const { handleSave, handleOpen } = useFileOperations();
  return (
    <DefaultMainMenu>
      {/* Add custom menu group for file operations like Save and Open */}
      <TldrawUiMenuGroup id="file-operations">
        <TldrawUiMenuItem
          id="save"
          label="Save"
          icon="file"
          readonlyOk
          onSelect={handleSave} // Call handleSave when this item is selected
        />
        <TldrawUiMenuItem
          id="open"
          label="Open"
          icon="folder"
          readonlyOk
          onSelect={handleOpen} // Call handleOpen when this item is selected
        />
      </TldrawUiMenuGroup>
      {/* Render the default main menu content */}
      <DefaultMainMenuContent />
    </DefaultMainMenu>
  );
}

function CustomNavigationPanel() {
  // Return null since no custom navigation panel is implemented
  return null;
}

function CustomPageMenu() {
  // Render the default page menu
  return <DefaultPageMenu />;
}

function CustomQuickActions() {
  // Render the default quick actions panel
  return (
    <DefaultQuickActions>
      {/* Render the default content for quick actions */}
      <DefaultQuickActionsContent />
    </DefaultQuickActions>
  );
}

function CustomStylePanel(props) {
  // Retrieve relevant styles using useRelevantStyles hook
  const styles = useRelevantStyles();
  return (
    <DefaultStylePanel {...props}>
      {/* Pass the retrieved styles to the DefaultStylePanelContent */}
      <DefaultStylePanelContent styles={styles} />
    </DefaultStylePanel>
  );
}

function CustomToolbar() {
  // Render the default toolbar
  return (
    <DefaultToolbar>
      {/* Render the default content for the toolbar */}
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}

function CustomZoomMenu() {
  // Render the default zoom menu
  return (
    <DefaultZoomMenu>
      {/* Render the default content for the zoom menu */}
      <DefaultZoomMenuContent />
    </DefaultZoomMenu>
  );
}

// Export custom components to override the default Tldraw UI components
export const components = {
  ActionsMenu: CustomActionsMenu,           // Custom actions menu
  ContextMenu: CustomContextMenu,           // Custom context menu
  DebugMenu: CustomDebugMenu,               // Custom debug menu
  HelpMenu: CustomHelpMenu,                 // Custom help menu
  KeyboardShortcutsDialog: CustomKeyboardShortcutsDialog, // Custom keyboard shortcuts dialog
  MainMenu: CustomMainMenu,                 // Custom main menu
  NavigationPanel: CustomNavigationPanel,   // Custom navigation panel (currently empty)
  PageMenu: CustomPageMenu,                 // Custom page menu
  QuickActions: CustomQuickActions,         // Custom quick actions panel
  StylePanel: CustomStylePanel,             // Custom style panel
  Toolbar: CustomToolbar,                   // Custom toolbar
  ZoomMenu: CustomZoomMenu,                 // Custom zoom menu
};
