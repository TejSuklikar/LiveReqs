# Welcome
I’ve built a web application designed specifically for Product Managers who want to streamline the process of creating effective use cases. My app takes a high-level description and transforms it into a detailed specification, a flowchart, and even an executable flow that you can validate by simulating different test scenarios. This tool is all about making it easier to gather feedback from business users and refine your product’s requirements with confidence. To support this functionality, I used Tldraw as the canvas, providing a flexible and interactive space for users to visualize and work with their use cases.

# Getting Started With the App
**1. Clone the Repository:** Begin by cloning this repository into your VSCode environment.

**2. Open a New Terminal:** In VSCode, open a new terminal and split it into two.

**3. Set Up the Backend:**
- In one terminal, navigate to the backend directory with cd backend.
  
- Run npm install to install the necessary dependencies.
  
- Install the vm2 package by typing npm install vm2.
  
- Start the backend server by executing node server.js.
  
**4. Set Up the Frontend:**
- Start the frontend by typing npm start.

**You’re All Set! The app is now ready to use.**

# Main Features:
1. Generate an extensive Use Case Description
2. Generate a diagram in Mermaid Markdown representing the Use Case
3. Generate JavaScript Code representing the Use Case
4. Generate Test Cases for the JavaScript Code
5. Run the Test Cases on the JavaScript Code

# Extra Features:
1. Save and Open .tldr files
2. Change Colors of Shapes and Text
3. Resize Shapes and Dynamically Move Them Around the Canvas
