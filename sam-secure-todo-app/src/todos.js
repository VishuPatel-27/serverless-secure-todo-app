  // This file contains the AWS Lambda handlers for the To-Do application's CRUD operations.

  const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
  const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand, // Use ScanCommand with caution for large tables
    QueryCommand, // Prefer QueryCommand for user-specific data
  } = require("@aws-sdk/lib-dynamodb");
  const { v4: uuidv4 } = require('uuid'); // For generating unique To-Do IDs

  // Initialize DynamoDB client and document client
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  // Get the DynamoDB table name from environment variables
  const TODOS_TABLE_NAME = process.env.TODOS_TABLE_NAME;

  // Helper function to send HTTP responses
  const generateResponse = (statusCode, body) => {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS for frontend
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
      },
      body: JSON.stringify(body),
    };
  };

  /**
   * Common handler for OPTIONS requests to enable CORS.
   * This is crucial for single-page applications interacting with API Gateway.
   */
  exports.optionsHandler = async (event) => {
    console.log("Received OPTIONS request:", event);
    return generateResponse(200, {});
  };


  /**
   * Lambda handler for creating a new To-Do item.
   * Requires authentication.
   *
   * @param {object} event - The Lambda event object.
   * @param {object} event.requestContext.authorizer.claims - Cognito user claims.
   * @param {string} event.body - JSON string of the To-Do item (e.g., { "title": "Buy groceries", "description": "Milk, bread, eggs" }).
   */
  exports.createTodoHandler = async (event) => {
    console.log("Received createTodo request:", event);

    try {
      // Extract userId from Cognito claims. This ensures the To-Do belongs to the authenticated user.
      const userId = event.requestContext.authorizer.claims.sub; // 'sub' is the unique user identifier in Cognito
      if (!userId) {
        return generateResponse(401, { message: "Unauthorized: User ID not found in token." });
      }

      const requestBody = JSON.parse(event.body);
      const { title, description } = requestBody;

      // Basic input validation
      if (!title || typeof title !== 'string' || title.trim() === '') {
        return generateResponse(400, { message: "Title is required and must be a non-empty string." });
      }
      if (description && typeof description !== 'string') {
          return generateResponse(400, { message: "Description must be a string." });
      }

      const todoId = uuidv4(); // Generate a unique ID for the To-Do item
      const createdAt = new Date().toISOString();

      const params = {
        TableName: TODOS_TABLE_NAME,
        Item: {
          userId: userId,
          todoId: todoId,
          title: title,
          description: description || '', // Default to empty string if no description
          status: 'pending', // Initial status
          createdAt: createdAt,
          updatedAt: createdAt,
        },
      };

      console.log("Putting item into DynamoDB:", params.Item);
      await docClient.send(new PutCommand(params));

      return generateResponse(201, { message: "To-Do item created successfully.", todo: params.Item });
    } catch (error) {
      console.error("Error creating To-Do item:", error);
      // Return a generic error message for security, log detailed error internally
      return generateResponse(500, { message: "Failed to create To-Do item. Please try again later." });
    }
  };

  /**
   * Lambda handler for retrieving all To-Do items for the authenticated user.
   * Requires authentication.
   *
   * @param {object} event - The Lambda event object.
   * @param {object} event.requestContext.authorizer.claims - Cognito user claims.
   */
  exports.getTodosHandler = async (event) => {
    console.log("Received getTodos request:", event);

    try {
      const userId = event.requestContext?.authorizer?.claims?.sub;
      if (!userId) {
        return generateResponse(401, { message: "Unauthorized: User ID not found in token." });
      }

      // Use QueryCommand to efficiently retrieve items for a specific user (partition key)
      const params = {
        TableName: TODOS_TABLE_NAME,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: {
          ':u': userId,
        },
      };

      console.log("Querying DynamoDB with params:", params);
      const data = await docClient.send(new QueryCommand(params));
      const todos = data.Items || [];

      return generateResponse(200, { todos: todos });
    } catch (error) {
      console.error("Error getting To-Do items:", error);
      return generateResponse(500, { message: "Failed to retrieve To-Do items. Please try again later." });
    }
  };

  /**
   * Lambda handler for updating an existing To-Do item.
   * Requires authentication.
   *
   * @param {object} event - The Lambda event object.
   * @param {object} event.requestContext.authorizer.claims - Cognito user claims.
   * @param {string} event.pathParameters.id - The todoId of the item to update.
   * @param {string} event.body - JSON string of updates (e.g., { "status": "completed" }).
   */
  exports.updateTodoHandler = async (event) => {
    console.log("Received updateTodo request:", event);

    try {
      const userId = event.requestContext?.authorizer?.claims?.sub;
      if (!userId) {
        return generateResponse(401, { message: "Unauthorized: User ID not found in token." });
      }

      const todoId = event.pathParameters.id;
      if (!todoId) {
        return generateResponse(400, { message: "To-Do ID is required." });
      }

      const requestBody = JSON.parse(event.body);
      const { title, description, status } = requestBody;

      // Build UpdateExpression and ExpressionAttributeValues dynamically
      const updateExpressions = [];
      const expressionAttributeValues = {};
      const expressionAttributeNames = {}; // For reserved keywords like 'status'

      if (title !== undefined) {
        updateExpressions.push('#t = :t');
        expressionAttributeNames['#t'] = 'title';
        expressionAttributeValues[':t'] = title;
        if (typeof title !== 'string' || title.trim() === '') {
          return generateResponse(400, { message: "Title must be a non-empty string." });
        }
      }
      if (description !== undefined) {
        updateExpressions.push('#d = :d');
        expressionAttributeNames['#d'] = 'description';
        expressionAttributeValues[':d'] = description;
        if (typeof description !== 'string') {
          return generateResponse(400, { message: "Description must be a string." });
        }
      }
      if (status !== undefined) {
        if (!['pending', 'completed'].includes(status)) { // Example allowed statuses
          return generateResponse(400, { message: "Status must be 'pending' or 'completed'." });
        }
        updateExpressions.push('#s = :s');
        expressionAttributeNames['#s'] = 'status';
        expressionAttributeValues[':s'] = status;
      }

      // Always update 'updatedAt' timestamp
      updateExpressions.push('updatedAt = :ua');
      expressionAttributeValues[':ua'] = new Date().toISOString();

      if (updateExpressions.length === 0) {
        return generateResponse(400, { message: "No valid fields provided for update." });
      }

      const params = {
        TableName: TODOS_TABLE_NAME,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        UpdateExpression: 'SET ' + updateExpressions.join(', '),
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW', // Return the updated item
        // Use ExpressionAttributeNames if you have reserved keywords in your updates
        ExpressionAttributeNames: expressionAttributeNames,
      };

      console.log("Updating item in DynamoDB with params:", params);
      const data = await docClient.send(new UpdateCommand(params));

      if (!data.Attributes) {
        return generateResponse(404, { message: "To-Do item not found or unauthorized to update." });
      }

      return generateResponse(200, { message: "To-Do item updated successfully.", todo: data.Attributes });
    } catch (error) {
      console.error("Error updating To-Do item:", error);
      if (error.name === 'ValidationException' && error.message.includes('The provided key element does not match the schema')) {
        return generateResponse(400, { message: "Invalid To-Do ID or data format." });
      }
      return generateResponse(500, { message: "Failed to update To-Do item. Please try again later." });
    }
  };

  /**
   * Lambda handler for deleting a To-Do item.
   * Requires authentication.
   *
   * @param {object} event - The Lambda event object.
   * @param {object} event.requestContext.authorizer.claims - Cognito user claims.
   * @param {string} event.pathParameters.id - The todoId of the item to delete.
   */
  exports.deleteTodoHandler = async (event) => {
    console.log("Received deleteTodo request:", event);

    try {
      const userId = event.requestContext?.authorizer?.claims?.sub;
      if (!userId) {
        return generateResponse(401, { message: "Unauthorized: User ID not found in token." });
      }

      const todoId = event.pathParameters.id;
      if (!todoId) {
        return generateResponse(400, { message: "To-Do ID is required." });
      }

      const params = {
        TableName: TODOS_TABLE_NAME,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        ReturnValues: 'ALL_OLD', // To check if an item was actually deleted
      };

      console.log("Deleting item from DynamoDB with params:", params);
      const data = await docClient.send(new DeleteCommand(params));

      if (!data.Attributes) {
        return generateResponse(404, { message: "To-Do item not found or unauthorized to delete." });
      }

      return generateResponse(200, { message: "To-Do item deleted successfully." });
    } catch (error) {
      console.error("Error deleting To-Do item:", error);
      return generateResponse(500, { message: "Failed to delete To-Do item. Please try again later." });
    }
  };