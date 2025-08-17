/**
 * Unit tests for the To-Do application Lambda functions
 * using Jest and AWS SDK mock.
 * @jest-environment node
 * @group unit
 * @group todos
 * @module todos.test.js
 */
const { mockClient } = require('aws-sdk-client-mock');
const { PutCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const {
  createTodoHandler,
  getTodosHandler,
  updateTodoHandler,
  deleteTodoHandler,
  optionsHandler
} = require('../../todos');

const { v4: uuidv4 } = require('uuid');

// Mock the DynamoDB DocumentClient
const ddbMock = mockClient(DynamoDBDocumentClient);

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

const mockUserId = 'user-123';

/**
 * Helper function to create a mock event for testing
 * @param {Object} options - Options for the event
 * @param {string} options.method - HTTP method (default: 'POST')
 * @param {Object} options.pathParams - Path parameters (default: {})
 * @param {Object} options.body - Request body (default: {})
 * @param {boolean} options.authorizer - Whether to include authorizer claims (default: true)
 * @return {Object} - Mock event object
 */
const createEvent = ({ method = 'POST', pathParams = {}, body = {}, authorizer = true } = {}) => {
  const event = {
    httpMethod: method,
    pathParameters: pathParams,
    body: JSON.stringify(body),
  };

  if (authorizer) {
    event.requestContext = {
      authorizer: {
        claims: {
          sub: mockUserId
        }
      }
    };
  }

  // When authorizer = false, do NOT include requestContext
  return event;
};

// Reset the mock before each test
beforeEach(() => {
  ddbMock.reset();
  jest.clearAllMocks();
});

// Mock the DynamoDB DocumentClient
describe('optionsHandler', () => {
  it('should return 200 for OPTIONS request', async () => {
    const result = await optionsHandler({});
    expect(result.statusCode).toBe(200);
  });
});

/**
 * Unit tests for the createTodoHandler function
 * @group createTodoHandler
 * @module createTodoHandler.test.js
 */
describe('createTodoHandler', () => {
  it('should create a todo successfully', async () => {
    ddbMock.on(PutCommand).resolves({});

    const event = createEvent({ body: { title: 'Test Todo', description: 'A test item' } });
    const response = await createTodoHandler(event);

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.todo.title).toBe('Test Todo');
    expect(body.todo.todoId).toBe('mock-uuid');
  });

  it('should return 400 for invalid title', async () => {
    const event = createEvent({ body: { title: '', description: 'desc' } });
    const response = await createTodoHandler(event);

    expect(response.statusCode).toBe(400);
  });

  it('should return 401 for missing user', async () => {
    const event = createEvent({ authorizer: false });
    const response = await createTodoHandler(event);

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).message).toMatch(/unauthorized/i);
  });

  it('should return 500 if DynamoDB put fails', async () => {
  ddbMock.on(PutCommand).rejects(new Error('DynamoDB is down'));

  const event = createEvent({ body: { title: 'Test Title', description: 'Test' } });
  const response = await createTodoHandler(event);

  expect(response.statusCode).toBe(500);
  const body = JSON.parse(response.body);
  expect(body.message).toMatch(/Failed to create To-Do item. Please try again later./i);
  });

});

/**
 * Unit tests for the getTodosHandler function
 * @group getTodosHandler
 * @module getTodosHandler.test.js
 */
describe('getTodosHandler', () => {
  it('should return todos for user', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ todoId: '1', title: 'Todo 1' }]
    });

    const event = createEvent({ method: 'GET' });
    const response = await getTodosHandler(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.todos.length).toBe(1);
    expect(body.todos[0].title).toBe('Todo 1');
  });

  it('should return 401 for missing user', async () => {
    const event = createEvent({ method: 'GET', authorizer: false });
    const response = await getTodosHandler(event);

    expect(response.statusCode).toBe(401);
  });

   it('should return 500 if DynamoDB query fails', async () => {
     ddbMock.on(QueryCommand).rejects(new Error('DynamoDB is down'));

     const event = createEvent({ method: 'GET' });
     const response = await getTodosHandler(event);

     expect(response.statusCode).toBe(500);
     const body = JSON.parse(response.body);
     expect(body.message).toMatch(/Failed to retrieve To-Do items. Please try again later./i);
  });
});

/**
 * Unit tests for the updateTodoHandler function
 * @group updateTodoHandler
 * @module updateTodoHandler.test.js
 */
describe('updateTodoHandler', () => {

  it('should return 401 for missing user', async () => {
    const event = createEvent({ method: 'PUT', pathParams: { id: '1' }, authorizer: false });
    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).message).toMatch(/Unauthorized: User ID not found in token./i);
  });

  it('should update a todo successfully', async () => {
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { todoId: '1', title: 'Updated Title' }
    });

    const event = createEvent({
      method: 'PUT',
      pathParams: { id: '1' },
      body: { title: 'Updated Title' }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.todo.title).toBe('Updated Title');
  });

  it ('should return 400 for missing to-do id', async () => {
    const event = createEvent({
      method: 'PUT',
      pathParams: {}
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toMatch(/To-Do ID is required./i);
  });

  it('should return 400 for missing title', async () => {
    const event = createEvent({
      method: 'PUT',
      pathParams: { id: '1' },
      body: { title: '', description: 'Test Description' }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toMatch(/Title must be a non-empty string./i);
  });

  it('should return 400 for missing description', async () => {
    const event = createEvent({
      method: 'PUT',
      pathParams: { id: '1' },
      body: { title: 'Test Title', description: 123 }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toMatch(/Description must be a string./i);
  });

  it('should return 400 for invalid status', async () => {
    const event = createEvent({
      method: 'PUT',
      pathParams: { id: '1' },
      body: { status: 'done' }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toMatch(/Status must be 'pending' or 'completed'./i);
  });

  it('should return 404 if item is not found or unauthorized to update', async () => {
    // Simulate a case where the item is not found
    // No Attributes returned
    ddbMock.on(UpdateCommand).resolves({}); 
    const event = createEvent({
      method: 'PUT',
      pathParams: { id: '1' },
      body: { title: 'Test' }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).message).toMatch(/To-Do item not found or unauthorized to update./i);
  });

  it('should return 500 if DynamoDB update fails', async () => {
    ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB is down'));

    const event = createEvent({
      method: 'PUT',
      pathParams: { id: '1' },
      body: { title: 'Test' }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.message).toMatch(/Failed to update To-Do item. Please try again later./i);
  });

  it('should return 400 if DynamoDB key does not match the schema', async () => {
    const error = new Error('The provided key element does not match the schema');
    error.name = 'ValidationException';

    ddbMock.on(UpdateCommand).rejects(error);
    const event = createEvent({
      method: 'PUT',
      pathParams: { id: 'invalid-key' },
      body: {
        title: 'Test'
      }
    });

    const response = await updateTodoHandler(event);
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toMatch(/Invalid To-Do ID or data format./i);
  });
  
});

/**
 * Unit tests for the deleteTodoHandler function
 * @group deleteTodoHandler
 * @module deleteTodoHandler.test.js
 */
describe('deleteTodoHandler', () => {
  it('should delete a todo successfully', async () => {
    ddbMock.on(DeleteCommand).resolves({
      Attributes: { todoId: '1' }
    });

    const event = createEvent({
      method: 'DELETE',
      pathParams: { id: '1' }
    });

    const response = await deleteTodoHandler(event);
    expect(response.statusCode).toBe(200);
  });

  it('should return 401 for missing user', async () => {
    const event = createEvent({ method: 'DELETE', pathParams: { id: '1' }, authorizer: false });
    const response = await deleteTodoHandler(event);
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).message).toMatch(/Unauthorized: User ID not found in token./i);
  });

  it('should return 404 if todo not found', async () => {
    ddbMock.on(DeleteCommand).resolves({}); // No Attributes
    const event = createEvent({
      method: 'DELETE',
      pathParams: { id: '1' }
    });

    const response = await deleteTodoHandler(event);
    expect(response.statusCode).toBe(404);
  });

  it('should return 400 for missing id', async () => {
    const event = createEvent({
      method: 'DELETE',
      pathParams: {}
    });

    const response = await deleteTodoHandler(event);
    expect(response.statusCode).toBe(400);
  });

  it('should return 500 if DynamoDB update fails', async () => {
    ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB is down'));

    const event = createEvent({
      method: 'DELETE',
      pathParams: { id: '1' },
      body: { title: 'Test' }
    });

    const response = await deleteTodoHandler(event);
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.message).toMatch(/Failed to delete To-Do item. Please try again later./i);
  });
});
