Introduction

Welcome to the EPL343.Winter23.Team1 project. This guide provides detailed instructions for setting up and running the application.


Prerequisites
Before you begin, ensure you have the following installed:

Node.js (version v20.10.0)


Installation Steps

Step 1: Install Node.js

Ensure you have Node.js version v20.10.0 installed on your system. You can download it from the official Node.js website.

Step 2: Clone the Repository

Clone the EPL343.Winter23.Team1 repository to your local machine.

Step 3: Install Dependencies

Navigate to the root directory of the cloned repository and execute the following commands in your command prompt:

npm install mssql

npm install express

npm install moment-timezone

These commands will install all the necessary dependencies required for the project.


Running the Application

User Site

Navigate to the \epl343.winter23.team1-main\epl343.winter23.team1-main directory.

Run the command node user/server.js.

The user site should now be accessible.


Admin Portal

From the root directory, navigate to the admin folder using the command cd admin.

Run the command node server.js.

Access the admin portal using the password 1234.


Troubleshooting

If you encounter any issues during the setup or execution, ensure that you have correctly followed all the installation steps and that you are using the correct version of Node.js. If problems persist, verify that all dependencies are correctly installed.

For further assistance, please contact the project maintainers or refer to the project documentation.
