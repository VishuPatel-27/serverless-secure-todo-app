/**
 * Utility module to create a DynamoDB client for testing purposes.
 * This client is configured to connect to a local DynamoDB instance
 * using environment variables defined in a .env.test file.
 * @module utils/dynamoClient
 * @requires @aws-sdk/client-dynamodb
 * @requires dotenv
 * @description This module exports a configured DynamoDB client
 * for use in unit and integration tests. It reads configuration
 * from environment variables to connect to a local DynamoDB instance,
 * which is useful for testing without needing to connect to a live AWS service.
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
require('dotenv').config({ path: '.env.test' });

const client = new DynamoDBClient({
  endpoint: process.env.LOCALSTACK_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = client;
