const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import route modules
const usecaseRoutes = require('./routes/usecase');
const diagramRoutes = require('./routes/diagram');

const app = express(); // Initialize the Express application
const PORT = 5001; // Define the port on which the backend server will run

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS) to allow requests from different origins
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON request bodies

// Routes
app.use('/api/usecase', usecaseRoutes);
app.use('/api/diagram', diagramRoutes);

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});