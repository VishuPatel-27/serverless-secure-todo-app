/**
 * Integration test for the updateTodoHandler function.
 * This test verifies that a todo item can be updated successfully.
 * It sets up a DynamoDB table, inserts a todo item, and then updates it.
 * It checks the response and verifies the updated item in the database.
 * After the tests, it cleans up by deleting the table.
 * @jest-environment node
 */
const client = require('../utils/dynamoClient');
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { createTodosTable, deleteTodosTable } = require('../utils/setupDynamo');
const { updateTodoHandler } = require('../../src/todos');

require('dotenv').config({ path: '.env.test' });

/**
 * Sets up the DynamoDB table and inserts a todo item before running tests.
 * Cleans up by deleting the table after tests.
 * @returns {Promise<void>}
 */
beforeAll(async () => {
  await createTodosTable();

  // Insert item to update
  const putParams = {
    TableName: process.env.TODOS_TABLE_NAME,
    Item: {
      userId: 'user-3',
      todoId: 'todo-123',
      title: 'Old Title',
      description: 'Old Desc',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  await client.send(new PutCommand(putParams));
});

/**
 * Cleans up the DynamoDB table after tests.
 * @returns {Promise<void>}
 */
afterAll(async () => {
  await deleteTodosTable();
});

/**
 * Integration test for updating a todo item.
 * It sends an event to the updateTodoHandler and checks the response. 
 * It verifies that the todo item is updated in the database.
 * @returns {Promise<void>}
 */
describe('Integration: updateTodoHandler', () => {
  it('updates a todo item successfully', async () => {
    const event = {
      pathParameters: {
        id: 'todo-123',
      },
      body: JSON.stringify({
        title: 'Updated Title',
        status: 'completed',
      }),
      requestContext: {
        authorizer: {
          claims: {
            sub: 'user-3',
          },
        },
      },
    };

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(200);

    const updated = JSON.parse(response.body).todo;
    expect(updated.title).toBe('Updated Title');
    expect(updated.status).toBe('completed');

    // Verify in DB
    const getParams = {
      TableName: process.env.TODOS_TABLE_NAME,
      Key: { userId: 'user-3', todoId: 'todo-123' },
    };
    const dbItem = await client.send(new GetCommand(getParams));
    expect(dbItem.Item.title).toBe('Updated Title');
  });
});
