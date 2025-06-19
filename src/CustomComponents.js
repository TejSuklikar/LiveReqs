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
  useRelevantStyles,
} from '@tldraw/tldraw';
import { useFileOperations } from './fileOperations';

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
