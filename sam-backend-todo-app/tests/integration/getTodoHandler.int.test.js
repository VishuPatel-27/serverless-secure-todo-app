/**
 * Integration test for getTodosHandler
 * This test checks if the handler correctly retrieves todo items for a user.
 * It uses a test DynamoDB table and inserts a test item before running the test.
 * After the test, it cleans up by deleting the test table.
 * @jest-environment node
 */
const client = require('../utils/dynamoClient');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { createTodosTable, deleteTodosTable } = require('../utils/setupDynamo');
const { getTodosHandler } = require('../../todos');

require('dotenv').config({ path: '.env.test' });

/**
 * Sets up the test environment by creating a DynamoDB table
 * and inserting a test item for the getTodosHandler.
 * This runs before all tests in this file.
 * @returns {Promise<void>}
 */
beforeAll(async () => {
  await createTodosTable();

  // Insert a test item for getTodosHandler
  const putParams = {
    TableName: process.env.TODOS_TABLE_NAME,
    Item: {
      userId: 'user-2',
      todoId: 'todo-1',
      title: 'Test get todos',
      description: 'Integration get test',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  await client.send(new PutCommand(putParams));
});

/**
 * Cleans up the test environment by deleting the DynamoDB table.
 * This runs after all tests in this file.
 * @returns {Promise<void>}
 */
afterAll(async () => {
  await deleteTodosTable();
});

/**
 * Integration test for getTodosHandler
 * This test checks if the handler retrieves todo items for a user.
 * It mocks the event with a user ID and verifies the response.
 * It expects the response to contain a list of todos,
 * including the test item inserted in beforeAll.
 */
describe('Integration: getTodosHandler', () => {
  it('retrieves todo items for user', async () => {
    const event = {
      requestContext: {
        authorizer: {
          claims: {
            sub: 'user-2',
          },
        },
      },
    };
    
    const response = await getTodosHandler(event);
    expect(response.statusCode).toBe(200);

    const responseBody = JSON.parse(response.body);
    expect(Array.isArray(responseBody.todos)).toBe(true);
    expect(responseBody.todos.length).toBeGreaterThan(0);

    const todo = responseBody.todos.find(t => t.todoId === 'todo-1');
    expect(todo).toBeDefined();
    expect(todo.title).toBe('Test get todos');
  });
});
