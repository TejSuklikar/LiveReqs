import { useEditor } from '@tldraw/tldraw';

export function useFileOperations() {
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
