/**
 * Utility functions to set up and tear down the DynamoDB Todos table for testing.
 * This includes creating the table before tests and deleting it after tests.
 * It uses AWS SDK v3 for DynamoDB operations.
 * @module setupDynamo
 */
const { CreateTableCommand, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');
const client = require('./dynamoClient');

/**
 * Creates the Todos table in DynamoDB.
 * The table has a partition key 'userId' and a sort key 'todoId'.
 * The table uses on-demand billing mode.
 * If the table already exists, it catches the ResourceInUseException and does not throw an
 * error.
 * @returns {Promise<void>} A promise that resolves when the table is created or already exists
 * or rejects if there is an error other than ResourceInUseException.
 * @throws {Error} If there is an error other than ResourceInUseException.
 */
async function createTodosTable() {
  const params = {
    TableName: process.env.TODOS_TABLE_NAME,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },   // Partition key
      { AttributeName: 'todoId', KeyType: 'RANGE' },  // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'todoId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  };

  try {
    await client.send(new CreateTableCommand(params));
    // console.log(`DynamoDB table ${params.TableName} created`);
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      // console.log(`Table ${params.TableName} already exists`);
    } else {
      throw error;
    }
  }
}

/**
 * Deletes the Todos table in DynamoDB.
 * If the table does not exist, it catches the ResourceNotFoundException and does not throw an
 * error.
 * @returns {Promise<void>} A promise that resolves when the table is deleted or does not exist
 * or rejects if there is an error other than ResourceNotFoundException.
 * @throws {Error} If there is an error other than ResourceNotFoundException.
 */
async function deleteTodosTable() {
  try {
    await client.send(new DeleteTableCommand({ TableName: process.env.TODOS_TABLE_NAME }));
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`Table ${process.env.TODOS_TABLE_NAME} does not exist`);
    } else {
      throw error;
    }
  }
}

/**
 * Exports the createTodosTable and deleteTodosTable functions for use in test setup and teardown.
 */
module.exports = {
  createTodosTable,
  deleteTodosTable,
};
