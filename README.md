# Serverless Secure To-Do App

## Overview
This project is a full-stack, serverless, and secure To-Do application built with AWS SAM (Serverless Application Model) for the backend and a modern JavaScript frontend. It demonstrates best practices in authentication, authorization, and secure API design using AWS services and the AWS SDK v3.

## Features
- User authentication and authorization with AWS Cognito
- Secure CRUD operations for To-Do items (Create, Read, Update, Delete)
- Encrypted DynamoDB data using customer managed KMS key
- Serverless backend using AWS Lambda, API Gateway, and DynamoDB
- Modern frontend with modular JavaScript, Webpack, and Babel
- Frontend hosted on AWS S3 bucket and served using CloudFront with AWS WAF enabled
- End-to-end unit testing with Jest and mocking for AWS Amplify
- Integration testing using LocalStack for offline AWS service emulation
- Static Application Security Testing (SAST) using ESLint with security plugins
- Infrastructure as Code (IaC) linting with cfn-lint
- Infrastructure SAST using Checkov
- Environment-based configuration for easy deployment
- Security best practices enforced via automated tools and AWS recommendations

## Project Structure
```
serverless-secure-todo-app/
│
├── sam-backend-todo-app/                # AWS SAM backend (Lambda, DynamoDB, API Gateway)
│   ├── src/
│   │   ├── todos.js                     # Main Lambda handler for To-Do logic
│   │   └── utils/
│   │       ├── dynamoClient.js          # DynamoDB client setup
│   │       └── setupDynamo.js           # DynamoDB table setup utilities
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── createTodoHandler.int.test.js
│   │   │   ├── deleteTodoHandler.int.test.js
│   │   │   ├── getTodoHandler.int.test.js
│   │   │   └── updateTodoHandler.int.test.js
│   │   └── unit/
│   │       └── todos.test.js
│   ├── events/
│   │   └── event.json                   # Sample event payloads for testing
│   ├── template.yaml                    # SAM/CloudFormation template
│   ├── package.json                     # Backend dependencies
│   ├── Makefile                         # Build and test automation
│   ├── samconfig.toml                   # SAM CLI configuration
│   └── eslint.config.cjs                # ESLint config for backend
│
└── todo-app-frontend/                   # Frontend app (modular JS, Webpack, Babel)
	├── frontend-src/
	│   ├── amplifyConfig.js             # AWS Amplify configuration
	│   ├── authHandlers.js              # Authentication logic
	│   ├── main.js                      # App entry point
	│   ├── todoHandlers.js              # To-Do CRUD logic
	│   └── uiHandlers.js                # UI rendering and event handlers
	├── tests/
	│   ├── amplifyConfig.test.js
	│   ├── authHandlers.test.js
	│   ├── todoHandlers.test.js
	│   └── uiHandlers.js
	├── __mocks__/
	│   ├── aws-amplify.js
	│   └── @aws-amplify/
	│       ├── api.js
	│       └── auth.js
	├── index.html                       # Main HTML entry point
	├── package.json                     # Frontend dependencies
	├── webpack.config.js                # Webpack config
	├── babel.config.cjs                 # Babel config
	├── eslint.config.js                 # ESLint config for frontend
	├── jest.config.cjs                  # Jest config
	├── .env                             # Environment variables (not committed)
	├── .nvmrc                           # Node version manager config
	└── dist/                            # Production build output (generated)
```

## Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)
- AWS CLI configured with appropriate credentials
- AWS SAM CLI (for backend deployment)

## Installation

### 1. Clone the Repository
```sh
git clone https://github.com/VishuPatel-27/serverless-secure-todo-app.git
cd serverless-secure-todo-app
```

### 2. Install Backend Dependencies
```sh
cd sam-backend-todo-app
npm install
```

### 3. Install Frontend Dependencies
```sh
cd ../todo-app-frontend
npm install
```

## Usage

### 1. Running Unit Tests
- **Backend:**
	```sh
	cd sam-backend-todo-app
	npm run test:unit
	```
- **Frontend:**
	```sh
	cd todo-app-frontend
	npm run test
	```
### 2. Running integration testing
To run integration test on backend makesure localstack is running on your system:
- **Backend:**
	```sh
	cd sam-backend-todo-app
	npm run test:int-create
    npm run test:int-get
    npm run test:int-delete
    npm run test:int-update
	```
### 3. Linting and Security Checks
Run ESLint and SAST tools to check for code quality and security issues:
- **Backend:**
	```sh
	cd sam-backend-todo-app
	npm run lint
	```
- **Frontend:**
	```sh
	cd todo-app-frontend
	npm run lint
    ```
### 4. Infrastructure testing
- **Backend:**
    ```sh
    cd sam-backend-todo-app
    pip install cfn-lint
    # Run cfn-lint on the SAM template
    cfn-lint template.yaml

    pip install checkov
    checkov -f ./template.yaml
    ```
### 5. Deploy the Backend
```sh
cd sam-backend-todo-app
sam build
sam deploy --guided
```
Follow the prompts to set up your AWS resources. Note the API endpoint and Cognito details for frontend configuration.

### 6. Configure the Frontend
Edit `todo-app-frontend/frontend-src/amplifyConfig.js` and update the API and Auth endpoints with your deployed backend and Cognito details.

### 7. Build and Run the Frontend
```sh
cd todo-app-frontend
npm run build
```
### 8. upload build artifactes to S3 bucket
``` sh
aws s3 cp ./dist/bundle.js s3://frontend-bucket-name
aws s3 cp ./index.html s3://frontend-bucket-name
```

## API Documentation

### Endpoints

#### POST /todos
- **Description:** Create a new To-Do item.
- **Request Body:**
	```json
	{
		"title": "string",
		"description": "string"
	}
	```
- **Response:**
	`201 Created`
	```json
	{
		"todo": { "todoId": "string", "title": "string", "description": "string", ... }
	}
	```

#### GET /todos
- **Description:** Get all To-Do items for the authenticated user.
- **Response:**
	`200 OK`
	```json
	{
		"todos": [ { "todoId": "string", "title": "string", ... }, ... ]
	}
	```

#### PUT /todos/{id}
- **Description:** Update a To-Do item.
- **Request Body:**
	```json
	{
		"title": "string (optional)",
		"description": "string (optional)",
		"status": "pending|completed"
	}
	```
- **Response:**
	`200 OK`
	```json
	{
		"todo": { "todoId": "string", "title": "string", ... }
	}
	```

#### DELETE /todos/{id}
- **Description:** Delete a To-Do item.
- **Response:**
	`200 OK`
	```json
	{
		"message": "To-Do deleted"
	}
	```

**All endpoints require authentication via AWS Cognito.**

## Troubleshooting

### Common Issues

- **CORS Errors:**
	Ensure your API Gateway and Lambda functions have the correct CORS headers and that your frontend is using the correct API endpoint.

- **Authentication Fails:**
	Double-check your Cognito configuration in both the backend and `amplifyConfig.js` on the frontend.

- **Deployment Fails:**
	- Make sure AWS credentials are set up and you have the necessary permissions.
	- Check for typos or missing resources in `template.yaml`.

- **Frontend Build Issues:**
	- Run `npm install` to ensure all dependencies are installed.
	- If you see module resolution errors, check your Webpack and Babel configs.

- **Tests Failing:**
	- Ensure you’re running tests in the correct directory.
	- Check for missing mocks or outdated snapshots.

- **LocalStack Integration Issues:**
	- Make sure LocalStack is running and your AWS SDK is configured to use it for integration tests.

## Contributing

1. Fork the repository and create your feature branch:
	 ```sh
	 git checkout -b feature/your-feature
	 ```
2. Commit your changes with clear messages.
3. Ensure all tests and linters pass before pushing.
4. Push to your fork and open a pull request.
5. Describe your changes and reference any related issues.

## Security
- Do not commit secrets or credentials. Use environment variables and AWS IAM roles.
- Run SAST and dependency checks regularly.
- Review and follow AWS security best practices.

## License
This project is licensed under the Apache License.
