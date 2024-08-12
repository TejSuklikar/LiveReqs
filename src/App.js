import React, { useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default function App() {
  // State to hold the Tldraw editor instance
  const [editor, setEditor] = useState(null);
  // State to hold the description input by the user
  const [description, setDescription] = useState('');
  const [fileLoaded, setFileLoaded] = useState(false);
  // States to control the visibility of different boxes
  const [showUseCaseBox, setShowUseCaseBox] = useState(false);
  const [showDiagramBox, setShowDiagramBox] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [showTestCasesBox, setShowTestCasesBox] = useState(false);
  const [showResultsBox, setShowResultsBox] = useState(false);
  // State to hold any notification messages
  const [notification, setNotification] = useState(null);
  // State to hold the API key entered by the user
  const [apiKey, setApiKey] = useState('');
  const [isUseCaseLoading, setIsUseCaseLoading] = useState(false);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isTestCasesLoading, setIsTestCasesLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);

  const onMount = (editor) => {
    // Save the editor instance to state
    setEditor(editor);
  
    // Create initial shapes on the Tldraw canvas
    editor.createShapes([
      {
        id: 'shape:1', // Unique identifier for the shape
        type: 'geo', // Type of shape (geometric shape)
        x: 100, // X position on the canvas
        y: 100, // Y position on the canvas
        props: {
          w: 300, // Width of the shape
          h: 150, // Height of the shape
          geo: 'rectangle', // Shape type (rectangle)
          color: 'black', // Border color
          fill: 'none', // Fill color (none)
          dash: 'draw', // Border style (dashed)
          size: 'm', // Border size (medium)
          font: 'draw', // Font style for text
          text: 'Type here...', // Initial text inside the shape
          align: 'middle', // Horizontal alignment of text
          verticalAlign: 'middle', // Vertical alignment of text
        },
      },
      {
        id: 'shape:2', // Unique identifier for the text label
        type: 'text', // Type of shape (text)
        x: 100, // X position on the canvas
        y: 50, // Y position on the canvas
        props: {
          text: 'Description', // Text content
          size: 'l', // Text size (large)
          font: 'draw', // Font style
          color: 'black', // Text color
        },
      },
    ]);
  
    // Set up an event listener for updates to the editor
    editor.on('update', () => {
      // Get the shape with ID 'shape:1'
      const descriptionShape = editor.getShape('shape:1');
      if (descriptionShape) {
        // Update the description state with the text content of the shape
        setDescription(descriptionShape.props.text);
      }
    });
  };
  
  const handleGoClick = async () => {
    setIsUseCaseLoading(true);
    let useCaseDescription = 'Use Case Description Generating...'; // Initial loading message
  
    const shapeExists = (shapeId) => editor.getShape(shapeId) !== undefined;
  
    // Always create or update the use case box
    if (!shapeExists('shape:usecasebox')) {
      editor.createShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          x: 500,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: useCaseDescription,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:usecaselabel',
          type: 'text',
          x: 500,
          y: 50,
          props: {
            text: 'Use Case',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
      setShowUseCaseBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          props: {
            text: useCaseDescription,
          },
        },
      ]);
    }
  
    // Check if the description is empty or the default text
    if (description.trim() === '' || description === 'Type here...') {
      // Reset the shape text to 'Type here...' if the input is empty
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: {
            text: 'Type here...',
          },
        },
      ]);
      useCaseDescription = 'Please enter a description.';
    } else {
      try {
        // Send the description to the backend to generate a use case description
        const response = await axios.post('http://localhost:5001/api/usecase', {
          description: description, // Send the current description
          apiKey: apiKey, // Include the API key
        });
        // Update the use case description with the response or fallback to default
        useCaseDescription = response.data.completion || 'Use Case Description';
      } catch (error) {
        console.error('Error generating use case description:', error);
        // If there's an error, update with an error message
        useCaseDescription = 'Error generating use case. Please try again.';
      }
    }
  
    // Update the use case box with the final content
    if (shapeExists('shape:usecasebox')) {
      editor.updateShapes([
        {
          id: 'shape:usecasebox',
          type: 'geo',
          props: {
            text: useCaseDescription,
            align: 'start',
            verticalAlign: 'start',
          },
        },
      ]);
    }
  
    setIsUseCaseLoading(false);
  };
  
  const handleGenerateMermaidMarkdownClick = async () => {
    setIsDiagramLoading(true);
    let diagram = 'Mermaid Markdown Generating...'; // Initial loading message
  
    const shapeExists = (shapeId) => editor.getShape(shapeId) !== undefined;
  
    // Always create or update the diagram box
    if (!shapeExists('shape:markdownbox')) {
      editor.createShapes([
        {
          id: 'shape:markdownbox',
          type: 'geo',
          x: 1300,
          y: 100,
          props: {
            w: 700,
            h: 600,
            geo: 'rectangle',
            color: 'black',
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            text: diagram,
            align: 'middle',
            verticalAlign: 'middle',
          },
        },
        {
          id: 'shape:markdownlabel',
          type: 'text',
          x: 1300,
          y: 50,
          props: {
            text: 'Markdown',
            size: 'l',
            font: 'draw',
            color: 'black',
          },
        },
      ]);
      setShowDiagramBox(true);
    } else {
      editor.updateShapes([
        {
          id: 'shape:markdownbox',
          type: 'geo',
          props: {
            text: diagram,
          },
        },
      ]);
    }
  
    // Check if the description is empty or the default text
    if (description.trim() === '' || description === 'Type here...') {
      // If the description is empty, reset the shape text to 'Type here...'
      editor.updateShapes([
        {
          id: 'shape:1',
          type: 'geo',
          props: {
            text: 'Type here...',
          },
        },
      ]);
      diagram = 'Please enter a description.';
    } else {
      try {
        // Retrieve the use case description from the editor
        const useCaseDescription = shapeExists('shape:usecasebox') 
          ? editor.getShape('shape:usecasebox').props.text 
          : 'Use case not available';
  
        // Send a request to the backend to generate Mermaid Markdown
        const response = await axios.post('http://localhost:5001/api/diagram', {
          description: description,
          useCaseDescription: useCaseDescription,
          apiKey: apiKey,
        });
  
        // Update the diagram variable with the response or fallback to default text
        diagram = response.data.completion || 'Mermaid Markdown';
      } catch (error) {
        console.error('Error generating Mermaid Markdown:', error);
        // If there's an error, set the diagram to an error message
        diagram = 'Error generating diagram. Please try again.';
      }
    }
  
    // Update the diagram box with the final content
    if (shapeExists('shape:markdownbox')) {
      editor.updateShapes([
        {
          id: 'shape:markdownbox',
          type: 'geo',
          props: {
            text: diagram,
            align: 'start',
            verticalAlign: 'start',
          },
        },
      ]);
    }
  
    setIsDiagramLoading(false);
  };

  const handleGenerateCodeClick = async () => {
  setIsCodeLoading(true);
  let code = 'Code is Generating...'; // Initial loading message

  const shapeExists = (shapeId) => editor.getShape(shapeId) !== undefined;

  // Always create or update the code box
  if (!shapeExists('shape:codebox')) {
    editor.createShapes([
      {
        id: 'shape:codebox',
        type: 'geo',
        x: 2100,
        y: 100,
        props: {
          w: 700,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: code,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:codelabel',
        type: 'text',
        x: 2100,
        y: 50,
        props: {
          text: 'Code',
          size: 'l',
          font: 'draw',
          color: 'black',
        },
      },
    ]);
    setShowCodeBox(true);
  } else {
    editor.updateShapes([
      {
        id: 'shape:codebox',
        type: 'geo',
        props: {
          text: code,
        },
      },
    ]);
  }

  // Check if the description is empty or the default text
  if (description.trim() === '' || description === 'Type here...') {
    // If the description is empty, reset the shape text to 'Type here...'
    editor.updateShapes([
      {
        id: 'shape:1',
        type: 'geo',
        props: {
          text: 'Type here...',
        },
      },
    ]);
    code = 'Please enter a description.';
  } else {
    try {
      // Retrieve the use case description from the editor
      const useCaseDescription = shapeExists('shape:usecasebox')
        ? editor.getShape('shape:usecasebox').props.text
        : 'Use case not available';

      // Send a request to the backend to generate JavaScript code
      const response = await axios.post('http://localhost:5001/api/code', {
        description: description,
        useCaseDescription: useCaseDescription,
        apiKey: apiKey,
      });

      // Update the code variable with the response or fallback to default text
      code = response.data.completion || 'JavaScript Code';
    } catch (error) {
      console.error('Error generating JavaScript code:', error);
      // If there's an error, set the code to an error message
      code = 'Error generating code. Please try again.';
    }
  }

  // Update the code box with the final content
  if (shapeExists('shape:codebox')) {
    editor.updateShapes([
      {
        id: 'shape:codebox',
        type: 'geo',
        props: {
          text: code,
          align: 'start',
          verticalAlign: 'start',
        },
      },
    ]);
  }

  setIsCodeLoading(false);
};
  
const handleTestCasesClick = async () => {
  setIsTestCasesLoading(true);
  let testCases = 'Test Cases Are Generating...'; // Initial loading message

  const shapeExists = (shapeId) => editor.getShape(shapeId) !== undefined;

  // Always create or update the test cases box
  if (!shapeExists('shape:testcasebox')) {
    editor.createShapes([
      {
        id: 'shape:testcasebox',
        type: 'geo',
        x: 2900,
        y: 100,
        props: {
          w: 700,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: testCases,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:testcaselabel',
        type: 'text',
        x: 2900,
        y: 50,
        props: {
          text: 'Test Cases',
          size: 'l',
          font: 'draw',
          color: 'black',
        },
      },
    ]);
    setShowTestCasesBox(true);
  } else {
    editor.updateShapes([
      {
        id: 'shape:testcasebox',
        type: 'geo',
        props: {
          text: testCases,
        },
      },
    ]);
  }

  // Check if the description is empty or the default text
  if (description.trim() === '' || description === 'Type here...') {
    // If the description is empty, reset the shape text to 'Type here...'
    editor.updateShapes([
      {
        id: 'shape:1',
        type: 'geo',
        props: {
          text: 'Type here...',
        },
      },
    ]);
    testCases = 'Please enter a description.';
  } else {
    try {
      // Retrieve the generated code from the editor
      const code = shapeExists('shape:codebox')
        ? editor.getShape('shape:codebox').props.text
        : 'Code not available';

      // Send a request to the backend to generate test cases based on the code and description
      const response = await axios.post('http://localhost:5001/api/testcases', {
        description: description,
        code: code,
        apiKey: apiKey,
      });

      // Update the testCases variable with the response or fallback to default text
      testCases = response.data.completion || 'Test Cases';
    } catch (error) {
      console.error('Error generating test cases:', error);
      // If there's an error, set the testCases to an error message
      testCases = 'Error generating test cases. Please try again.';
    }
  }

  // Update the test cases box with the final content
  if (shapeExists('shape:testcasebox')) {
    editor.updateShapes([
      {
        id: 'shape:testcasebox',
        type: 'geo',
        props: {
          text: testCases,
          align: 'start',
          verticalAlign: 'start',
        },
      },
    ]);
  }

  setIsTestCasesLoading(false);
};

  
  const handleRunTestsClick = async () => {
  setIsResultsLoading(true);
  let results = 'Running Tests...'; // Initial loading message

  const shapeExists = (shapeId) => editor.getShape(shapeId) !== undefined;

  // Always create or update the results box
  if (!shapeExists('shape:resultsbox')) {
    editor.createShapes([
      {
        id: 'shape:resultsbox',
        type: 'geo',
        x: 3700,
        y: 100,
        props: {
          w: 700,
          h: 600,
          geo: 'rectangle',
          color: 'black',
          fill: 'none',
          dash: 'draw',
          size: 'm',
          font: 'draw',
          text: results,
          align: 'middle',
          verticalAlign: 'middle',
        },
      },
      {
        id: 'shape:resultslabel',
        type: 'text',
        x: 3700,
        y: 50,
        props: {
          text: 'Test Results',
          size: 'l',
          font: 'draw',
          color: 'black',
        },
      },
    ]);
    setShowResultsBox(true);
  } else {
    editor.updateShapes([
      {
        id: 'shape:resultsbox',
        type: 'geo',
        props: {
          text: results,
        },
      },
    ]);
  }

  // Check if the description is empty or the default text
  if (description.trim() === '' || description === 'Type here...') {
    // If the description is empty, reset the shape text to 'Type here...'
    editor.updateShapes([
      {
        id: 'shape:1',
        type: 'geo',
        props: {
          text: 'Type here...',
        },
      },
    ]);
    results = 'Please enter a description and generate code and test cases first.';
  } else {
    try {
      // Get the code and test cases from the editor, if they exist
      const code = shapeExists('shape:codebox') ? editor.getShape('shape:codebox').props.text : '';
      const testCasesText = shapeExists('shape:testcasebox') ? editor.getShape('shape:testcasebox').props.text : '';

      if (!code || !testCasesText) {
        throw new Error("Code or test cases are missing. Please generate them first.");
      }

      // Attempt to extract the function name from the provided code
      const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{/);
      if (!functionMatch) {
        throw new Error("No simulation function found in the provided code");
      }
      const simulationFunctionName = functionMatch[1]; // Extract the simulation function name

      // Parse the test cases using the extracted function name
      const testCases = parseTestCases(testCasesText, simulationFunctionName);

      // Log the code and test cases for debugging purposes
      console.log('Sending code:', code);
      console.log('Sending test cases:', testCases);

      // Send the code and parsed test cases to the backend for execution
      const response = await axios.post('http://localhost:5001/api/runtests', {
        code: code,
        testCases: testCases,
      });

      // Update the results with the output from the backend
      results = response.data.results ? response.data.results.join('\n\n') : 'Test Results';
      console.log('Test Results:', results);
    } catch (error) {
      console.error('Error running test cases:', error);
      results = `Error running test cases: ${error.message}`;
    }
  }

  // Update the results box with the final content
  if (shapeExists('shape:resultsbox')) {
    editor.updateShapes([
      {
        id: 'shape:resultsbox',
        type: 'geo',
        props: {
          text: results,
          align: 'start',
          verticalAlign: 'start',
        },
      },
    ]);
  }

  setIsResultsLoading(false);
};
  // Helper function to parse test cases
  function parseTestCases(testCasesText, simulationFunctionName) {
    const testCases = [];
    // Regular expression to match test cases and expected outputs
    const testCaseRegex = new RegExp(`//\\s*Test case.*?\\n(function\\s+testCase\\d+\\s*\\(\\)\\s*{[\\s\\S]*?})\\s*const\\s+expectedOutput\\d+\\s*=\\s*\\[([\\s\\S]*?)\\];`, 'g');
    let match;
  
    // Loop through the matches in the test cases text
    while ((match = testCaseRegex.exec(testCasesText)) !== null) {
      const [, testFunction, expectedOutputArray] = match;
      const functionMatch = testFunction.match(/function\s+(testCase\d+)/);
      if (functionMatch) {
        const name = functionMatch[1]; // Extract the test case name
        // Extract the scenario from the test function
        const scenarioMatch = testFunction.match(new RegExp(`${simulationFunctionName}\\("(\\w+)"\\)`));
        const scenario = scenarioMatch ? scenarioMatch[1] : 'unknown';
        // Parse the expected output into an array
        const expectedOutput = JSON.parse(`[${expectedOutputArray}]`);
        
        // Add the parsed test case to the test cases array
        testCases.push({ name, scenario, expectedOutput });
      }
    }
  
    return testCases; // Return the array of parsed test cases
  }  

  const handleSave = async () => {
    if (editor) {
        try {
            // Serialize the editor state
            let serializedData = editor.store.serialize();

            // Ensure the schema version is set
            if (!serializedData.schemaVersion) {
                serializedData.schemaVersion = 2; // Set to the appropriate version
            }

            // Wrap the serialized data under the 'store' key to match the required format
            const wrappedData = {
                store: serializedData,
                schema: {
                    schemaVersion: serializedData.schemaVersion,
                    sequences: serializedData.sequences // Ensure sequences are properly included
                }
            };

            // Convert the wrapped data to a JSON string
            const fileContent = JSON.stringify(wrappedData, null, 2);

            // Use the File System Access API to show a save file picker
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: 'usecase.tldr',
                types: [{
                    description: 'TLDraw Files',
                    accept: { 'application/json': ['.tldr'] },
                }],
            });

            // Create a writable stream
            const writableStream = await fileHandle.createWritable();
            
            // Write the file content to the selected location
            await writableStream.write(fileContent);

            // Close the writable stream to complete the save
            await writableStream.close();

            console.log('File saved successfully');
        } catch (error) {
            console.error('Error saving the file:', error);
        }
    } else {
        console.error('Editor is not initialized');
    }
};



const handleOpen = () => {
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

        // Normalize the snapshot structure
        if (!snapshot.store) {
          snapshot = {
            store: snapshot,
            schema: {
              schemaVersion: snapshot.schemaVersion || 1,
              storeVersion: 1,
              recordVersions: {
                asset: { version: 1, subTypeKey: 'type', subTypeVersions: {} },
                camera: { version: 1 },
                document: { version: 2 },
                instance: { version: 21 },
                page: { version: 1 },
                shape: { version: 3, subTypeKey: 'type', subTypeVersions: {} },
                instance_page_state: { version: 5 },
                pointer: { version: 1 },
              },
            },
          };
        }

        // Ensure all records in the store have a valid typeName
        const validTypes = ['asset', 'camera', 'document', 'instance', 'page', 'shape', 'instance_page_state', 'pointer'];
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

        // Ensure essential records exist
        if (!snapshot.store['document:document']) {
          snapshot.store['document:document'] = { id: 'document:document', typeName: 'document', gridSize: 10 };
        }
        if (!snapshot.store['page:page']) {
          snapshot.store['page:page'] = { id: 'page:page', typeName: 'page', name: 'Page 1', index: 'a1' };
        }

        if (editor && editor.store) {
          editor.store.loadSnapshot(snapshot);

          if (isEditorReady()) {
            try {
              editor.updateViewportScreenBounds();
            } catch (error) {
              console.warn('Error updating viewport:', error);
              setNotification('Warning: There was an issue updating the viewport. Please check your layout.');
            }
          }

          // No notification for compatibility modifications
          setNotification(null); // Clear any previous notifications
        } else {
          console.error('Editor or editor.store is not available');
          setNotification('Error: Editor is not initialized. Please try reloading the page.');
        }
      } catch (error) {
        console.error('Error loading snapshot:', error);
        setNotification(`An error occurred while loading the file: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// Helper function to check if the editor is fully initialized
const isEditorReady = () => {
  return editor && editor.store && editor.getViewportScreenBounds();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target.result);

              if (editor && editor.store) {
                  editor.store.loadSnapshot(json); // Load the snapshot directly
              }
          } catch (error) {
              console.error('Error parsing file:', error);
              alert('Error parsing file. Please ensure the file is valid.');
          }
      };
      reader.readAsText(file);
  }
};

// Example validation function
const validateSnapshot = (json) => {
    // Perform various checks on the snapshot JSON structure
    // Ensure essential fields exist and have valid types
    if (typeof json.schemaVersion !== 'number') {
        console.error('Invalid or missing schemaVersion.');
        return false;
    }
    if (!json.store || typeof json.store !== 'object') {
        console.error('Invalid or missing store data.');
        return false;
    }
    // Add more checks based on your schema requirements
    return true; // Return true if all validations pass
};

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* The main container that occupies the entire viewport */}
      <Tldraw key={fileLoaded} onMount={onMount} />
      {/* Hidden file input for opening .tldr files */}
      <input
        type="file"
        id="fileInput"
        accept=".tldr"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{
        position: 'absolute',
        bottom: '50px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000,
      }}>
        {/* Input field for entering the API key */}
        <input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            padding: '20px',
            borderRadius: '5px',
            border: '3px solid #000',
            marginBottom: '10px',
            color: '#000',
          }}
        />
        {/* Button to generate the use case, disabled if no API key is entered */}
        <button
          style={{
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: apiKey ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
          onClick={handleGoClick}
          disabled={!apiKey}
        >
          Generate Use Case
        </button>
        {/* Button to generate the Mermaid markdown, disabled if no API key is entered */}
        <button
          style={{
            backgroundColor: 'purple',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: apiKey ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
          onClick={handleGenerateMermaidMarkdownClick}
          disabled={!apiKey}
        >
          Generate Markdown
        </button>
        {/* Button to generate the JavaScript code, disabled if no API key is entered */}
        <button
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: apiKey ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
          onClick={handleGenerateCodeClick}
          disabled={!apiKey}
        >
          Generate JavaScript Code
        </button>
        {/* Button to generate the test cases, disabled if no API key is entered */}
        <button
          style={{
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: apiKey ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
          onClick={handleTestCasesClick}
          disabled={!apiKey}
        >
          Generate Test Cases
        </button>
        {/* Button to run the tests, disabled if no API key is entered */}
        <button
          style={{
            backgroundColor: 'orange',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: apiKey ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
          onClick={handleRunTestsClick}
          disabled={!apiKey}
        >
          Run Tests
        </button>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000,
      }}>
        {/* Button to save the current work as a .tldr file */}
        <button
          style={{
            backgroundColor: 'grey',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={handleSave}
        >
          Save
        </button>
        {/* Button to open a .tldr file */}
        <button
          style={{
            backgroundColor: 'grey',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={handleOpen}
        >
          Open
        </button>
      </div>
      {notification && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'yellow',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1001,
        }}>
          {/* Display a notification if there is one */}
          {notification}
        </div>
      )}
    </div>
  );
  
}
