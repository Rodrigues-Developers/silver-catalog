# Silver Catalog

Silver Catalog is a sample Angular application that demonstrates how to build a rich, production-ready catalog platform using a modern Angular frontend with LESS for styling and an integrated Node/Express backend for API handling.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development Server](#development-server)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Silver Catalog serves as a robust template for developers looking to create dynamic catalog applications. The app leverages Angular with LESS to allow flexible and maintainable styling while using an integrated Node/Express backend to streamline API requests. This setup makes it easier to customize and deploy your catalog application across various environments.

## Features

- **Modern Angular Frontend**: Developed using Angular CLI with a strong focus on modularity and maintainability.
- **LESS Styling**: Uses LESS instead of plain CSS to allow for improved style organization and extensibility.
- **Integrated Node/Express Backend**: A backend that handles API requests seamlessly as part of the application.
- **Cloud Readiness**: Comes pre-configured for deployment on platforms like Azure Static Web Apps.

## Technology Stack

- **Frontend**: Angular, TypeScript, HTML, LESS
- **Backend**: Node.js, Express
- **CI/CD**: GitHub Actions workflows in the `.github/workflows/` directory
- **Deployment**: Azure Static Web Apps

## Getting Started

### Prerequisites

- Node.js and npm
- Angular CLI (global installation is optional but recommended)

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Rodrigues-Developers/silver-catalog.git
cd silver-catalog
npm install
```

### Development Server

To run the application in development mode, execute:

```bash
npm run dev
After the server starts, navigate to http://localhost:4200 in your browser to view the app.
```

### Building for Production

To generate a production-ready build, run:

```bash
npm run build
The production build artifacts are stored in the dist/ directory.
```

### Deployment

#### Azure Static Web Apps

For detailed deployment instructions to Azure, refer to the [Manual publish to azure.md](Manual publish to azure.md) file.

Project Structure

```text
silver-catalog/
├── .github/workflows/         # CI/CD configuration files
├── e2e/                       # End-to-end test configuration (if applicable)
├── src/                       # Angular application source code
├── angular.json               # Angular CLI configuration
├── package.json               # npm dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── staticwebapp.config.json   # Azure Static Web Apps configuration
├── CHANGELOG.md               # Record of changes for each release
└── LICENSE.md                 # Licensing information
```

License
Silver Catalog is licensed under a custom license. Please refer to the LICENSE.md file for complete details.
