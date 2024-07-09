# Node.js Application with Prometheus Metrics and Alerting

This repository contains a Node.js application with Prometheus metrics integration for monitoring and alerting purposes.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Prometheus Setup](#prometheus-setup)


## Installation

1. **Clone this repository and make sure node is installed:**

   ```bash
   git clone https://github.com/AmanThankachan/CRUDappwithpromalert.git
   cd CRUDappwithpromalert
   sudo apt update
   sudo apt install -y nodejs npm
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```

## Usage

1. **Start the Node.js application:**
   ```bash
   npm start
   ```
   The application will start on http://localhost:3000.

2. **Access the following endpoints:**
   
   /users: Get all users (GET)
   
   /users/:id: Get a user by ID (GET)

   /users: Create a new user (POST)

   /users/:id: Update a user by ID (PUT)

   /users/:id: Delete a user by ID (DELETE)

   /metrics: Prometheus metrics endpoint


## Prometheus Setup 

1. **Download and Install Prometheus:**

   Download Prometheus from https://prometheus.io/download/
   
2. **Configure Prometheus:**
   Navigate to the Prometheus directory and copy prometheus.yaml from this repository.

   Add alert-rules.yaml incase alerting is required.
   
3. **Start Prometheus:**
   ```bash
   ./prometheus --config.file=prometheus.yaml
   ``` 
