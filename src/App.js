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
    let useCaseDescription = 'Use Case Description'; // Default use case description
  
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
  
    // Check if the use case box is already shown
    if (!showUseCaseBox) {
      // Create the use case description box on the canvas if it's not already there
      editor.createShapes([
        {
          id: 'shape:usecasebox', // Unique ID for the use case box
          type: 'geo', // Type of shape (geometric shape)
          x: 500, // X position on the canvas
          y: 100, // Y position on the canvas
          props: {
            w: 700, // Width of the shape
            h: 600, // Height of the shape
            geo: 'rectangle', // Shape type (rectangle)
            color: 'black', // Border color
            fill: 'none', // Fill color (none)
            dash: 'draw', // Border style (dashed)
            size: 'm', // Border size (medium)
            font: 'draw', // Font style for text
            text: useCaseDescription, // Use case description text
            align: 'start', // Horizontal text alignment (start/left)
            verticalAlign: 'start', // Vertical text alignment (start/top)
          },
        },
        {
          id: 'shape:usecaselabel', // Unique ID for the use case label
          type: 'text', // Type of shape (text)
          x: 500, // X position on the canvas
          y: 50, // Y position on the canvas
          props: {
            text: 'Use Case', // Text content
            size: 'l', // Text size (large)
            font: 'draw', // Font style
            color: 'black', // Text color
          },
        },
      ]);
      setShowUseCaseBox(true); // Update state to indicate the use case box is shown
    } else {
      // If the use case box already exists, update its content
      editor.updateShapes([
        {
          id: 'shape:usecasebox', // ID of the use case box
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: useCaseDescription, // Update the text with the new use case description
          },
        },
      ]);
    }
  };
  
  const handleGenerateMermaidMarkdownClick = async () => {
    let diagram = 'Mermaid Markdown'; // Default text for the Mermaid Markdown diagram
  
    // Check if the description is empty or the default text
    if (description.trim() === '' || description === 'Type here...') {
      // If the description is empty, reset the shape text to 'Type here...'
      editor.updateShapes([
        {
          id: 'shape:1', // The ID of the shape to update
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: 'Type here...', // Update the text inside the shape
          },
        },
      ]);
    } else {
      try {
        // Retrieve the use case description from the editor
        const useCaseDescription = editor.getShape('shape:usecasebox').props.text;
  
        // Send a request to the backend to generate Mermaid Markdown
        const response = await axios.post('http://localhost:5001/api/diagram', {
          description: description, // Current description entered by the user
          useCaseDescription: useCaseDescription, // Use case description from the canvas
          apiKey: apiKey, // API key for authentication
        });
  
        // Update the diagram variable with the response or fallback to default text
        diagram = response.data.completion || 'Mermaid Markdown';
      } catch (error) {
        console.error('Error generating Mermaid Markdown:', error);
        // If there's an error, set the diagram to an error message
        diagram = 'Error generating diagram. Please try again.';
      }
    }
  
    // Check if the diagram box is already displayed on the canvas
    if (!showDiagramBox) {
      // If not, create a new shape for the Mermaid Markdown diagram
      editor.createShapes([
        {
          id: 'shape:markdownbox', // Unique ID for the Markdown box
          type: 'geo', // Type of shape (geometric shape)
          x: 1300, // X position on the canvas
          y: 100, // Y position on the canvas
          props: {
            w: 700, // Width of the shape
            h: 600, // Height of the shape
            geo: 'rectangle', // Shape type (rectangle)
            color: 'black', // Border color
            fill: 'none', // Fill color (none)
            dash: 'draw', // Border style (dashed)
            size: 'm', // Border size (medium)
            font: 'draw', // Font style for text
            text: diagram, // Text content (Mermaid Markdown diagram)
            align: 'start', // Horizontal text alignment (start/left)
            verticalAlign: 'start', // Vertical text alignment (start/top)
          },
        },
        {
          id: 'shape:markdownlabel', // Unique ID for the Markdown label
          type: 'text', // Type of shape (text)
          x: 1300, // X position on the canvas
          y: 50, // Y position on the canvas
          props: {
            text: 'Markdown', // Label text
            size: 'l', // Text size (large)
            font: 'draw', // Font style
            color: 'black', // Text color
          },
        },
      ]);
      setShowDiagramBox(true); // Update state to indicate the diagram box is displayed
    } else {
      // If the diagram box already exists, update its content
      editor.updateShapes([
        {
          id: 'shape:markdownbox', // ID of the diagram box
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: diagram, // Update the text with the new Mermaid Markdown diagram
          },
        },
      ]);
    }
  };
  
  const handleGenerateCodeClick = async () => {
    let code = 'JavaScript Code'; // Default text for the JavaScript code
  
    // Check if the description is empty or the default text
    if (description.trim() === '' || description === 'Type here...') {
      // If the description is empty, reset the shape text to 'Type here...'
      editor.updateShapes([
        {
          id: 'shape:1', // The ID of the shape to update
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: 'Type here...', // Update the text inside the shape
          },
        },
      ]);
    } else {
      try {
        // Retrieve the use case description from the editor
        const useCaseDescription = editor.getShape('shape:usecasebox').props.text;
  
        // Send a request to the backend to generate JavaScript code
        const response = await axios.post('http://localhost:5001/api/code', {
          description: description, // Current description entered by the user
          useCaseDescription: useCaseDescription, // Use case description from the canvas
          apiKey: apiKey, // API key for authentication
        });
  
        // Update the code variable with the response or fallback to default text
        code = response.data.completion || 'JavaScript Code';
      } catch (error) {
        console.error('Error generating JavaScript code:', error);
        // If there's an error, set the code to an error message
        code = 'Error generating code. Please try again.';
      }
    }
  
    // Check if the code box is already displayed on the canvas
    if (!showCodeBox) {
      // If not, create a new shape for the JavaScript code
      editor.createShapes([
        {
          id: 'shape:codebox', // Unique ID for the code box
          type: 'geo', // Type of shape (geometric shape)
          x: 2100, // X position on the canvas
          y: 100, // Y position on the canvas
          props: {
            w: 700, // Width of the shape
            h: 600, // Height of the shape
            geo: 'rectangle', // Shape type (rectangle)
            color: 'black', // Border color
            fill: 'none', // Fill color (none)
            dash: 'draw', // Border style (dashed)
            size: 'm', // Border size (medium)
            font: 'draw', // Font style for text
            text: code, // Text content (JavaScript code)
            align: 'start', // Horizontal text alignment (start/left)
            verticalAlign: 'start', // Vertical text alignment (start/top)
          },
        },
        {
          id: 'shape:codelabel', // Unique ID for the code label
          type: 'text', // Type of shape (text)
          x: 2100, // X position on the canvas
          y: 50, // Y position on the canvas
          props: {
            text: 'Code', // Label text
            size: 'l', // Text size (large)
            font: 'draw', // Font style
            color: 'black', // Text color
          },
        },
      ]);
      setShowCodeBox(true); // Update state to indicate the code box is displayed
    } else {
      // If the code box already exists, update its content
      editor.updateShapes([
        {
          id: 'shape:codebox', // ID of the code box
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: code, // Update the text with the new JavaScript code
          },
        },
      ]);
    }
  };
  
  const handleTestCasesClick = async () => {
    let testCases = 'Test Cases'; // Default text for test cases
  
    // Check if the description is empty or the default text
    if (description.trim() === '' || description === 'Type here...') {
      // If the description is empty, reset the shape text to 'Type here...'
      editor.updateShapes([
        {
          id: 'shape:1', // The ID of the shape to update
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: 'Type here...', // Update the text inside the shape
          },
        },
      ]);
    } else {
      try {
        // Retrieve the generated code from the editor
        const code = editor.getShape('shape:codebox').props.text;
  
        // Send a request to the backend to generate test cases based on the code and description
        const response = await axios.post('http://localhost:5001/api/testcases', {
          description: description, // Current description entered by the user
          code: code, // JavaScript code from the canvas
          apiKey: apiKey, // API key for authentication
        });
  
        // Update the testCases variable with the response or fallback to default text
        testCases = response.data.completion || 'Test Cases';
      } catch (error) {
        console.error('Error generating test cases:', error);
        // If there's an error, set the testCases to an error message
        testCases = 'Error generating test cases. Please try again.';
      }
    }
  
    // Check if the test cases box is already displayed on the canvas
    if (!showTestCasesBox) {
      // If not, create a new shape for the test cases
      editor.createShapes([
        {
          id: 'shape:testcasebox', // Unique ID for the test case box
          type: 'geo', // Type of shape (geometric shape)
          x: 2900, // X position on the canvas
          y: 100, // Y position on the canvas
          props: {
            w: 700, // Width of the shape
            h: 600, // Height of the shape
            geo: 'rectangle', // Shape type (rectangle)
            color: 'black', // Border color
            fill: 'none', // Fill color (none)
            dash: 'draw', // Border style (dashed)
            size: 'm', // Border size (medium)
            font: 'draw', // Font style for text
            text: testCases, // Text content (Test Cases)
            align: 'start', // Horizontal text alignment (start/left)
            verticalAlign: 'start', // Vertical text alignment (start/top)
          },
        },
        {
          id: 'shape:testcaselabel', // Unique ID for the test case label
          type: 'text', // Type of shape (text)
          x: 2900, // X position on the canvas
          y: 50, // Y position on the canvas
          props: {
            text: 'Test Cases', // Label text
            size: 'l', // Text size (large)
            font: 'draw', // Font style
            color: 'black', // Text color
          },
        },
      ]);
      setShowTestCasesBox(true); // Update state to indicate the test cases box is displayed
    } else {
      // If the test cases box already exists, update its content
      editor.updateShapes([
        {
          id: 'shape:testcasebox', // ID of the test case box
          type: 'geo', // Type of shape (geometric shape)
          props: {
            text: testCases, // Update the text with the new test cases
          },
        },
      ]);
    }
  };
  
  const handleRunTestsClick = async () => {
    let results = 'Test Results'; // Default text for test results
    const code = editor.getShape('shape:codebox').props.text; // Get the code from the editor
    const testCasesText = editor.getShape('shape:testcasebox').props.text; // Get the test cases from the editor
  
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
    } else {
      try {
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
        results = 'Error running test cases. Please try again.';
      }
    }
  
    // Update the results box on the canvas
    if (!showResultsBox) {
      // If the results box is not yet displayed, create a new shape for it
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
            align: 'start',
            verticalAlign: 'start',
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
      setShowResultsBox(true); // Indicate that the results box is now displayed
    } else {
      // If the results box already exists, update its content
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

  const handleSave = () => {
    if (editor) {
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
        const blob = new Blob([JSON.stringify(wrappedData, null, 2)], { type: 'application/json' });

        // Prompt the user to enter a filename
        const filename = prompt('Enter filename to save:', 'usecase.tldr');
        if (filename) {
            // Save the file
            saveAs(blob, filename);
        }
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
              const snapshot = JSON.parse(content);

              if (editor && editor.store) {
                  // Use the built-in method to load the snapshot without custom validation
                  editor.store.loadSnapshot(snapshot);
              }
          } catch (error) {
              console.error('Error loading snapshot:', error);
              alert('An error occurred while loading the file. Please check the console for details.');
          }
      };
      reader.readAsText(file);
  };
  input.click();
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
      <Tldraw onMount={onMount} />
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
