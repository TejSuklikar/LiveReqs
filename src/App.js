import React, { useState } from 'react';
import '@tldraw/tldraw/tldraw.css';  // Tldraw base styling
import TldrawCanvas from './components/TldrawCanvas';
import ButtonsPanel from './components/ButtonsPanel';

export default function App() {
  // Top-level state
  const [editor, setEditor] = useState(null);       // Reference to Tldraw editor
  const [description, setDescription] = useState(''); 
  const [notification, setNotification] = useState(null);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* The Tldraw canvas */}
      <TldrawCanvas
        editor={editor}
        setEditor={setEditor}
        description={description}
        setDescription={setDescription}
      />

      {/* Notification banner if needed */}
      {notification && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'yellow',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1001,
          }}
        >
          {notification}
        </div>
      )}

      {/* Panel of buttons and their logic */}
      <ButtonsPanel
        editor={editor}
        description={description}
        setDescription={setDescription}
        notification={notification}
        setNotification={setNotification}
      />
    </div>
  );
}
