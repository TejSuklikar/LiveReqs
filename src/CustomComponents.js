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
  TldrawUiButton,
  TldrawUiButtonLabel,
  useEditor,
  useTools,
  useIsToolSelected,
  useRelevantStyles,
} from '@tldraw/tldraw';

function useFileOperations() {
  const editor = useEditor();

  const handleSave = async () => {
    if (editor) {
      try {
        let serializedData = editor.store.serialize();
  
        const normalizedData = {
          store: serializedData.store || serializedData,
          schema: {
            schemaVersion: serializedData.schemaVersion || 2, // Ensure schema version is set
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
  
        // Ensure essential records exist in the store
        if (!normalizedData.store['document:document']) {
          normalizedData.store['document:document'] = {
            id: 'document:document',
            typeName: 'document',
            gridSize: 10,
          };
        }
  
        if (!normalizedData.store['page:page']) {
          normalizedData.store['page:page'] = {
            id: 'page:page',
            typeName: 'page',
            name: 'Page 1',
            index: 'a1',
          };
        }
  
        const fileContent = JSON.stringify(normalizedData, null, 2);
  
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: 'usecase.tldr',
          types: [{
            description: 'TLDraw Files',
            accept: { 'application/json': ['.tldr'] },
          }],
        });
  
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(fileContent);
        await writableStream.close();
  
        console.log('File saved successfully');
      } catch (error) {
        console.error('Error saving the file:', error);
      }
    } else {
      console.error('Editor is not initialized');
    }
  };
  
  function normalizeSnapshot(snapshot) {
    // Ensure the store and schema objects exist
    if (!snapshot.store) {
        snapshot.store = {};
    }
    if (!snapshot.schema) {
        snapshot.schema = { schemaVersion: 2 };
    }
    
    // Ensure essential objects are present
    if (!snapshot.store['document:document']) {
        snapshot.store['document:document'] = {
            id: 'document:document',
            typeName: 'document',
            gridSize: 10,
            name: ''
        };
    }
    if (!snapshot.store['page:page']) {
        snapshot.store['page:page'] = {
            id: 'page:page',
            typeName: 'page',
            name: 'Page 1',
            index: 'a1'
        };
    }

    // Ensure all objects have the correct typeName
    const validTypes = ['document', 'page', 'shape', 'asset', 'camera', 'instance', 'pointer'];
    for (const [key, value] of Object.entries(snapshot.store)) {
        if (!value.typeName || !validTypes.includes(value.typeName)) {
            const inferredType = key.split(':')[0];
            if (validTypes.includes(inferredType)) {
                value.typeName = inferredType;
            } else {
                delete snapshot.store[key];
            }
        }
    }

    return snapshot;
}


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

                // Normalize the snapshot before loading
                snapshot = normalizeSnapshot(snapshot);

                if (editor && editor.store) {
                    editor.store.loadSnapshot(snapshot);
                } else {
                    console.error('Editor is not initialized');
                }
            } catch (error) {
                console.error('Error loading snapshot:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

  return { handleSave, handleOpen };
}

function CustomActionsMenu() {
  const { handleSave, handleOpen } = useFileOperations();
  return (
    <DefaultActionsMenu>
      <TldrawUiMenuItem
        id="save"
        label="Save"
        icon="file"
        readonlyOk
        onSelect={handleSave}
      />
      <TldrawUiMenuItem
        id="open"
        label="Open"
        icon="folder"
        readonlyOk
        onSelect={handleOpen}
      />
      <DefaultActionsMenuContent />
    </DefaultActionsMenu>
  );
}

function CustomContextMenu(props) {
  const { handleSave, handleOpen } = useFileOperations();
  return (
    <DefaultContextMenu {...props}>
      <TldrawUiMenuGroup id="file-operations">
        <TldrawUiMenuItem
          id="save"
          label="Save"
          icon="file"
          readonlyOk
          onSelect={handleSave}
        />
        <TldrawUiMenuItem
          id="open"
          label="Open"
          icon="folder"
          readonlyOk
          onSelect={handleOpen}
        />
      </TldrawUiMenuGroup>
      <DefaultContextMenuContent />
    </DefaultContextMenu>
  );
}

function CustomDebugMenu() {
  return (
    <DefaultDebugMenu>
      <DefaultDebugMenuContent />
    </DefaultDebugMenu>
  );
}

function CustomHelpMenu() {
  return (
    <DefaultHelpMenu>
      <DefaultHelpMenuContent />
    </DefaultHelpMenu>
  );
}

function CustomKeyboardShortcutsDialog(props) {
  return (
    <DefaultKeyboardShortcutsDialog {...props}>
      <DefaultKeyboardShortcutsDialogContent />
    </DefaultKeyboardShortcutsDialog>
  );
}

function CustomMainMenu() {
  const { handleSave, handleOpen } = useFileOperations();
  return (
    <DefaultMainMenu>
      <TldrawUiMenuGroup id="file-operations">
        <TldrawUiMenuItem
          id="save"
          label="Save"
          icon="file"
          readonlyOk
          onSelect={handleSave}
        />
        <TldrawUiMenuItem
          id="open"
          label="Open"
          icon="folder"
          readonlyOk
          onSelect={handleOpen}
        />
      </TldrawUiMenuGroup>
      <DefaultMainMenuContent />
    </DefaultMainMenu>
  );
}

function CustomNavigationPanel() {
  // You can customize this further if needed
  return null;
}

function CustomPageMenu() {
  return <DefaultPageMenu />;
}

function CustomQuickActions() {
  return (
    <DefaultQuickActions>
      <DefaultQuickActionsContent />
    </DefaultQuickActions>
  );
}

function CustomStylePanel(props) {
  const styles = useRelevantStyles();
  return (
    <DefaultStylePanel {...props}>
      <DefaultStylePanelContent styles={styles} />
    </DefaultStylePanel>
  );
}

function CustomToolbar() {
  return (
    <DefaultToolbar>
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}

function CustomZoomMenu() {
  return (
    <DefaultZoomMenu>
      <DefaultZoomMenuContent />
    </DefaultZoomMenu>
  );
}

export const components = {
  ActionsMenu: CustomActionsMenu,
  ContextMenu: CustomContextMenu,
  DebugMenu: CustomDebugMenu,
  HelpMenu: CustomHelpMenu,
  KeyboardShortcutsDialog: CustomKeyboardShortcutsDialog,
  MainMenu: CustomMainMenu,
  NavigationPanel: CustomNavigationPanel,
  PageMenu: CustomPageMenu,
  QuickActions: CustomQuickActions,
  StylePanel: CustomStylePanel,
  Toolbar: CustomToolbar,
  ZoomMenu: CustomZoomMenu,
};
