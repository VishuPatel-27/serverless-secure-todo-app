/**
 * Integration test for createTodoHandler
 * This test verifies that a todo item can be created successfully
 * and that it is stored correctly in DynamoDB.
 * It uses a mock user ID to simulate an authenticated request.
 * It requires the DynamoDB table to be set up before running the test.
 * It also cleans up the table after all tests are done.
 * @jest-environment node
 */
const { createTodosTable, deleteTodosTable } = require('../utils/setupDynamo');
const client = require('../utils/dynamoClient');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

require('dotenv').config({ path: '.env.test' });

/**
 * Import the createTodoHandler function from the todos module.
 * This function is responsible for handling the creation of todo items.
 */
const { createTodoHandler } = require('../../todos');

/**
 * Before all tests, create the DynamoDB table required for the tests.
 * This ensures that the table exists before any test runs.
*/
beforeAll(async () => {
  await createTodosTable();
});

/**
 * After all tests, delete the DynamoDB table to clean up.
 * This ensures that the table is removed after all tests are done,
 * preventing any leftover data from affecting future tests.
 */
afterAll(async () => {
  await deleteTodosTable();
});

/**
 * Integration test for createTodoHandler
 * This test verifies that a todo item can be created successfully
 * and that it is stored correctly in DynamoDB.
 */
describe('Integration - createTodoHandler', () => {
  it('should create a todo item', async () => {
    const event = {
      body: JSON.stringify({
        title: 'Test todo',
        description: 'Test description',
      }),
      requestContext: {
        authorizer: {
          claims: { sub: 'user-123' }, // Mock userId
        },
      },
    };

    const response = await createTodoHandler(event);

    expect(response.statusCode).toBe(201);

    /**
     * Verify that the response body contains the created todo item.
     * This checks that the handler returns the correct response
     * after creating a todo item.
     */
    const params = {
      TableName: process.env.TODOS_TABLE_NAME,
      Key: {
        userId: 'user-123',
        todoId: JSON.parse(response.body).todo.todoId,
      },
    };

    /**
     * Fetch the created todo item from DynamoDB
     * to verify that it was stored correctly.
     * This checks that the createTodoHandler function
     * not only creates the todo item but also stores it in the database.
     */
    const result = await client.send(new GetCommand(params));
    expect(result.Item).toBeDefined();
    expect(result.Item.title).toBe('Test todo');
  });
});
