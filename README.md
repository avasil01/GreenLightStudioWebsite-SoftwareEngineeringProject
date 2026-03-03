## Introduction

Welcome to the GreenLightStudioWebsite-SoftwareEngineeringProject.  
This guide provides detailed instructions for setting up and running the application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version v20.10.0)

You can download Node.js from the official website: https://nodejs.org/

---

## Installation Steps

### Step 1: Install Node.js

Ensure Node.js version v20.10.0 is installed on your system.

You can verify your installed version by running:
node -v

---

### Step 2: Clone the Repository

Clone the GreenLightStudioWebsite-SoftwareEngineeringProject repository to your local machine:
git clone https://github.com/yourusername/GreenLightStudioWebsite-SoftwareEngineeringProject.git

---

### Step 3: Install Dependencies

Navigate to the root directory of the project and install the required dependencies:
npm install mssql
npm install express
npm install moment-timezone

Alternatively, if `package.json` is properly configured, you can run:
npm install

---

## Running the Application

### User Site

Navigate to the project directory and run:
node user/server.js

The user site should now be running locally.

---

### Admin Portal

From the root directory, navigate to the admin folder:
cd admin

Then run:
node server.js

Access the admin portal using the password:
1234

---

## Troubleshooting

If you encounter any issues:

- Ensure you are using Node.js v20.10.0
- Verify all dependencies are installed correctly
- Confirm that the database configuration is properly set

If problems persist, review the project documentation or contact the project contributors.
