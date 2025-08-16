/**
 * @jest-environment jsdom
 * This file contains tests for the uiHandlers module.
 * It tests the functionality of showing the app itself, showing the auth section,
 * and rendering different tasks.
 * The tests ensure that the UI updates correctly when switching between auth and app sections,
 * and that todos are rendered correctly in the UI.
 */
import { showTodoApp, showAuthSection, renderTodos } from '../frontend-src/uiHandlers.js';

describe('uiHandlers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="auth-section"></div>
      <div id="todo-app-section"></div>
      <input id="email" />
      <input id="password" />
      <input id="confirmation-code" />
      <div id="todo-list"></div>
    `;
  });

  test('showTodoApp hides auth section and shows todo app section', () => {
    showTodoApp();
    expect(document.getElementById('auth-section').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('todo-app-section').classList.contains('hidden')).toBe(false);
  });

  test('showAuthSection shows auth section and hides todo app section and clears inputs', () => {
    showAuthSection();
    expect(document.getElementById('auth-section').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('todo-app-section').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('email').value).toBe('');
    expect(document.getElementById('password').value).toBe('');
    expect(document.getElementById('confirmation-code').value).toBe('');
  });

  test('renderTodos renders no todos message when todos empty', () => {
    renderTodos([], jest.fn(), jest.fn());
    expect(document.getElementById('todo-list').textContent).toContain('No To-Do items yet');
  });

  test('renderTodos renders todo items', () => {
    const todos = [
      { todoId: '1', title: 'Todo 1', status: 'pending', createdAt: new Date().toISOString() },
    ];
    renderTodos(todos, jest.fn(), jest.fn());
    expect(document.getElementById('todo-list').textContent).toContain('Todo 1');
  });
});
