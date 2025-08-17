/**
 * Integration test for deleteTodoHandler
 * This test verifies that a todo item can be deleted successfully
 * and that it is removed from DynamoDB.
 * It uses a mock user ID to simulate an authenticated request.
 * It requires the DynamoDB table to be set up before running the test.
 * @jest-environment node
 */
const client = require('../utils/dynamoClient');
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { createTodosTable, deleteTodosTable } = require('../utils/setupDynamo');
const { deleteTodoHandler } = require('../../todos');

require('dotenv').config({ path: '.env.test' });

/**
 * Before all tests, create the DynamoDB table required for the tests.
 * This ensures that the table exists before any test runs.
 * It also inserts a todo item that will be deleted in the test.
 * This setup is necessary to ensure that the delete operation can be tested.
 * @returns {Promise<void>}
 */
beforeAll(async () => {
  await createTodosTable();

  // Insert item to delete
  const putParams = {
    TableName: process.env.TODOS_TABLE_NAME,
    Item: {
      userId: 'user-4',
      todoId: 'todo-delete',
      title: 'Delete me',
      description: 'To be deleted',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  await client.send(new PutCommand(putParams));
});

/**
 * After all tests, delete the DynamoDB table to clean up.
 * This ensures that the table is removed after all tests are done,
 * preventing any leftover data from affecting future tests.
 * It also ensures that the test environment is reset for future runs.
 */
afterAll(async () => {
  await deleteTodosTable();
});


/**
 * Integration test for deleteTodoHandler
 * This test verifies that a todo item can be deleted successfully
 * and that it is removed from DynamoDB.
 * It checks that the response status code is 200 and that the item
 * is no longer present in the database after deletion.
 */
describe('Integration: deleteTodoHandler', () => {
  it('deletes a todo item successfully', async () => {
    const event = {
      pathParameters: {
        id: 'todo-delete',
      },
      requestContext: {
        authorizer: {
          claims: {
            sub: 'user-4',
          },
        },
      },
    };

    const response = await deleteTodoHandler(event);
    expect(response.statusCode).toBe(200);

    // Verify deletion in DB
    const getParams = {
      TableName: process.env.TODOS_TABLE_NAME,
      Key: { userId: 'user-4', todoId: 'todo-delete' },
    };
    const dbItem = await client.send(new GetCommand(getParams));
    expect(dbItem.Item).toBeUndefined();
  });
});
