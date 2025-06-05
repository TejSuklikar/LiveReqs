<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">

# LiveReqs

<em>Transform ideas into actionable, visual use cases</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/TejSuklikar/LiveReqs?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/TejSuklikar/LiveReqs?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/TejSuklikar/LiveReqs?style=flat&color=0080ff" alt="repo-language-count">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=react&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/Express.js-000000.svg?style=flat&logo=express&logoColor=white" alt="Express.js">
<img src="https://img.shields.io/badge/Tldraw-000000.svg?style=flat&logoColor=white" alt="Tldraw">
<img src="https://img.shields.io/badge/Axios-5A29E4.svg?style=flat&logo=axios&logoColor=white" alt="Axios">
<img src="https://img.shields.io/badge/NPM-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Claude-000000.svg?style=flat&logo=Anthropic&logoColor=white" alt="Claude AI">

</div>
<br>

---

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Testing](#testing)
- [Main Features](#main-features)
- [Extra Features](#extra-features)

---

## Overview

LiveReqs is a powerful web application designed specifically for Product Managers to streamline the creation of effective use cases. It transforms high-level descriptions into detailed specifications, diagrams, and executable flows that can be validated through test simulations. The app enables clear feedback loops with business users and ensures product requirements are both robust and collaborative.

TLDraw serves as the visual canvas for interaction, while Claude powers the use case, code, and test generation through natural language inputs.

---

## Demo

🎥 [Watch the Demo](https://drive.google.com/file/d/1vHlgmCA0g7pTzsWpSPBkkDVtMHJ_NYDg/view)

---

## Getting Started

### Prerequisites

This project requires the following:

- **Programming Language:** JavaScript
- **Package Manager:** npm
- **Frontend & Backend Tools:** React, Express
- **Special Library:** `vm2` (for safe backend code execution)

---

### Installation

1. **Clone the repository:**

```sh
git clone https://github.com/TejSuklikar/LiveReqs
cd LiveReqs
```

2. **Open the project in VSCode. Open a new terminal and split it into two.**

---

### Usage

#### A. Start the Backend

In one terminal:

```sh
cd backend
npm install
npm install vm2
node server.js
```

#### B. Start the Frontend

In the second terminal (root directory):

```sh
npm install
npm start
```

The app should now be running locally in your browser.

---

### Testing

LiveReqs uses the default React testing framework. To run tests:

```sh
npm test
```

---

## Main Features

- 🧠 **Use Case Generation:** Claude transforms high-level descriptions into structured, actionable specifications.
- 🧾 **Flowchart Creation:** Automatically creates flow diagrams in Mermaid markdown.
- 💻 **JavaScript Code Generation:** Produces JS implementations from use cases.
- 🧪 **Test Case Creation:** Generates and runs test cases on the code.
- 🧬 **Simulation Engine:** Securely runs user-generated code using `vm2` sandboxing.

---

## Extra Features

- 💾 Save and open `.tldr` files to persist work.
- 🎨 Customize colors and text for shapes.
- 🔄 Dynamically resize and move elements on the canvas.
- 🔗 Seamless backend-frontend interaction via Axios.

---

<div align="left"><a href="#top">⬆ Return</a></div>

---
