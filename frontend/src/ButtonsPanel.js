import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from './apiService';
import * as shapeHelpers from './shapeHelpers';

export default function ButtonsPanel({
  editor,
  description,
  setDescription,
  notification,
  setNotification,
  setRunAllFunction, // Add this prop to connect canvas button
}) {
  // Local states
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isUseCaseLoading, setIsUseCaseLoading] = useState(false);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);

  // API Key format validation function
  const validateApiKeyFormat = (key) => {
    // Basic Claude API key format validation
    const trimmedKey = key.trim();
    
    // Claude API keys start with 'sk-ant-' and are quite long (usually 100+ characters)
    const isValidFormat = trimmedKey.startsWith('sk-ant-') && trimmedKey.length > 50;
    
    return isValidFormat;
  };

  // SIMPLIFIED: Just validate format, don't test the API in real-time
  // (We'll test it when the user actually clicks a button)
  useEffect(() => {
    const formatValid = validateApiKeyFormat(apiKey);
    setIsApiKeyValid(formatValid);
  }, [apiKey]);

  // Get input border color based on validation state
  const getInputBorderColor = () => {
    if (!apiKey) return '#e1e5e9'; // Default gray
    if (isApiKeyValid) return '#28a745'; // Green for valid format
    return '#dc3545'; // Red for invalid format
  };

  // Get validation message
  const getValidationMessage = () => {
    if (!apiKey) return '';
    if (isApiKeyValid) return 'API key format is valid';
    return 'Invalid API key format (should start with sk-ant-)';
  };

  // Get validation message color
  const getValidationMessageColor = () => {
    if (!apiKey) return '#6c757d';
    if (isApiKeyValid) return '#28a745'; // Green for valid format
    return '#dc3545'; // Red for invalid format
  };

  // Button base styles
  const buttonBaseStyle = {
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    minWidth: '200px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  };

  const disabledButtonStyle = {
    ...buttonBaseStyle,
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  // Determine if buttons should be enabled - just check if API key format is valid
  const buttonsEnabled = apiKey && isApiKeyValid;

  // ----------------------------
  // 1) Generate Use Case
  // ----------------------------
  const handleGoClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsUseCaseLoading(true);
    const loadingText = 'Use Case Description Generating...';

    // Create or update the "use case" shape
    shapeHelpers.createOrUpdateUseCaseShapes(editor, loadingText);

    let useCaseDescription;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      useCaseDescription = 'Please enter a description.';
    } else {
      useCaseDescription = await apiService.generateUseCase(description, apiKey);
    }

    // Update the final text
    shapeHelpers.updateUseCaseShape(editor, useCaseDescription);
    setIsUseCaseLoading(false);

    // Auto-fit all shapes on screen
    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 2) Generate Mermaid Markdown
  // ----------------------------
  const handleGenerateMermaidMarkdownClick = async () => {
    if (!buttonsEnabled) return;
    
    setIsDiagramLoading(true);
    const loadingText = 'Mermaid Markdown Generating...';

    shapeHelpers.createOrUpdateMarkdownShapes(editor, loadingText);

    let diagram;
    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      diagram = 'Please enter a description.';
    } else {
      const useCaseDescription = shapeHelpers.shapeExists(editor, 'shape:usecasebox')
        ? editor.getShape('shape:usecasebox').props.text
        : 'Use case not available';

      diagram = await apiService.generateMermaidMarkdown(description, useCaseDescription, apiKey);
    }

    shapeHelpers.updateMarkdownShape(editor, diagram);
    setIsDiagramLoading(false);

    shapeHelpers.zoomOut(editor);
  };

  // ----------------------------
  // 3) Run All Sequentially (Use Case → Flowchart)
  // ----------------------------
  const handleRunAllClick = useCallback(async () => {
    if (!buttonsEnabled) return;

    if (description.trim() === '' || description === 'Type here...') {
      shapeHelpers.updateDescriptionShape(editor, 'Type here...');
      alert('Please enter a description first!');
      return;
    }

    try {
      console.log('Starting sequential execution...');

      // Step 1: Generate Use Case
      console.log('Step 1: Generating Use Case...');
      setIsUseCaseLoading(true);
      const loadingText1 = 'Use Case Description Generating...';
      shapeHelpers.createOrUpdateUseCaseShapes(editor, loadingText1);
      const useCaseDescription = await apiService.generateUseCase(description, apiKey);
      shapeHelpers.updateUseCaseShape(editor, useCaseDescription);
      setIsUseCaseLoading(false);
      shapeHelpers.zoomOut(editor);

      // Step 2: Generate Flowchart
      console.log('Step 2: Generating Flowchart...');
      setIsDiagramLoading(true);
      const loadingText2 = 'Mermaid Markdown Generating...';
      shapeHelpers.createOrUpdateMarkdownShapes(editor, loadingText2);
      const diagram = await apiService.generateMermaidMarkdown(description, useCaseDescription, apiKey);
      shapeHelpers.updateMarkdownShape(editor, diagram);
      setIsDiagramLoading(false);
      shapeHelpers.zoomOut(editor);

      console.log('All steps completed successfully!');

    } catch (error) {
      console.error('Error in sequential execution:', error);

      // Reset all loading states in case of error
      setIsUseCaseLoading(false);
      setIsDiagramLoading(false);

      alert(`Error in sequential execution: ${error.message}`);
    }
  }, [buttonsEnabled, description, editor, apiKey]);

  // Connect the handleRunAllClick function to the canvas button
  useEffect(() => {
    if (setRunAllFunction) {
      setRunAllFunction(() => handleRunAllClick);
    }
  }, [handleRunAllClick, setRunAllFunction]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Enter API Key */}
      <div style={{ position: 'relative' }}>
        <input
          type="password"
          placeholder="Enter Claude API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: `2px solid ${getInputBorderColor()}`,
            marginBottom: '8px',
            fontSize: '18px',
            minWidth: '200px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
        {/* Validation status indicator */}
        {apiKey && (
          <div style={{
            fontSize: '12px',
            marginTop: '-4px',
            marginBottom: '8px',
            color: getValidationMessageColor(),
            fontWeight: '500',
          }}>
            {getValidationMessage()}
          </div>
        )}
      </div>

      {/* Generate Use Case */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#007bff',
        }}
        onClick={handleGoClick}
        disabled={!buttonsEnabled || isUseCaseLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isUseCaseLoading) {
            e.target.style.backgroundColor = '#0056b3';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isUseCaseLoading) {
            e.target.style.backgroundColor = '#007bff';
          }
        }}
      >
        {isUseCaseLoading ? 'Generating...' : 'Generate Use Case'}
      </button>

      {/* Generate Markdown */}
      <button
        style={{
          ...(!buttonsEnabled ? disabledButtonStyle : buttonBaseStyle),
          backgroundColor: !buttonsEnabled ? '#6c757d' : '#6f42c1',
        }}
        onClick={handleGenerateMermaidMarkdownClick}
        disabled={!buttonsEnabled || isDiagramLoading}
        onMouseEnter={(e) => {
          if (buttonsEnabled && !isDiagramLoading) {
            e.target.style.backgroundColor = '#5a2d91';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonsEnabled && !isDiagramLoading) {
            e.target.style.backgroundColor = '#6f42c1';
          }
        }}
      >
        {isDiagramLoading ? 'Generating...' : 'Generate Flowchart'}
      </button>
    </div>
  );
}