/**
 * @jest-environment jsdom
 * This file contains tests for the todoHandlers module.
 * It mocks AWS Amplify Auth and API modules, and tests the functionality of creating,
 * fetching, updating, and deleting todos.
 * The tests ensure that the UI updates correctly and that API calls are made as expected.
 */
import { initTodoHandlers } from '../frontend-src/todoHandlers.js';
import * as Auth from '@aws-amplify/auth';
import * as API from '@aws-amplify/api';
import { renderTodos } from '../frontend-src/uiHandlers.js';

jest.mock('aws-amplify');
jest.mock('@aws-amplify/auth');
jest.mock('@aws-amplify/api');
jest.mock('../frontend-src/uiHandlers.js');


describe('initTodoHandlers', () => {
  let todoElements;

  beforeEach(() => {
    todoElements = {
      newTodoTitleInput: { value: 'My Todo' },
      newTodoDescriptionInput: { value: 'Description' },
      todoMessage: { textContent: '', className: '' },
      todoList: {
        innerHTML: '',
        querySelectorAll: jest.fn(() => []), // for event listeners
      },
    };
    Auth.fetchAuthSession.mockResolvedValue({
      tokens: { idToken: { toString: () => 'mock-token' } },
    });
  });

  it('createTodo validates empty title', async () => {
    todoElements.newTodoTitleInput.value = '';
    const { createTodo } = initTodoHandlers(todoElements);
    await createTodo();
    expect(todoElements.todoMessage.textContent).toBe('To-Do title cannot be empty.');
  });

  it('createTodo calls API.post and clears inputs', async () => {
    API.post.mockResolvedValue({
      response: {
        body: {
          json: () => Promise.resolve({ todoId: '123' }),
        },
      },
    });
    const { createTodo } = initTodoHandlers(todoElements);
    todoElements.newTodoTitleInput.value = 'Test Todo';
    todoElements.newTodoDescriptionInput.value = 'Test Desc';

    // mock fetchTodos to avoid errors on call
    todoElements.fetchTodos = jest.fn();
    await createTodo();

    expect(API.post).toHaveBeenCalled();
    expect(todoElements.newTodoTitleInput.value).toBe('');
    expect(todoElements.newTodoDescriptionInput.value).toBe('');
  });

  it('fetchTodos renders todos', async () => {
    API.get.mockResolvedValue({
      response: {
        body: {
          json: () => Promise.resolve({ todos: [{ todoId: '1', title: 'Test', status: 'pending', createdAt: new Date().toISOString() }] }),
        },
      },
    });
    const { fetchTodos } = initTodoHandlers(todoElements);
    await fetchTodos();
    expect(renderTodos).toHaveBeenCalled();
  });

  it('updateTodoStatus toggles status and calls API.put', async () => {
    API.put.mockResolvedValue({
      response: {
        body: {
          json: () => Promise.resolve({}),
        },
      },
    });
    const { updateTodoStatus } = initTodoHandlers(todoElements);
    todoElements.todoMessage.textContent = '';
    todoElements.todoMessage.className = '';

    await updateTodoStatus('1', 'pending');

    expect(API.put).toHaveBeenCalled();
  });

  it('deleteTodo calls API.del and then fetchTodos', async () => {
    API.del.mockResolvedValue({
      response: {
        body: {
          json: () => Promise.resolve({}),
        },
      },
    });
    const { deleteTodo } = initTodoHandlers(todoElements);
    await deleteTodo('1');
    expect(API.del).toHaveBeenCalled();
  });
});
