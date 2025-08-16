/**
 * uiHandlers.js
 * This module handles UI interactions for the To-Do application.
 * It provides functions to show/hide sections, render todos, and manage event listeners.
 * It also allows setting a reference to the fetchTodos function for later use.
 */
export let fetchTodosRef = null;

export function setFetchTodos(fn) {
  fetchTodosRef = fn;
}

export function showTodoApp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('todo-app-section').classList.remove('hidden');
  if (fetchTodosRef) fetchTodosRef();
}

export function showAuthSection() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('todo-app-section').classList.add('hidden');
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('confirmation-code').value = '';
}

export function renderTodos(todos, updateTodoStatus, deleteTodo) {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';
  if (todos.length === 0) {
    todoList.innerHTML = '<p class="text-gray-500 text-center">No To-Do items yet. Add one above!</p>';
    return;
  }
  todos.forEach(todo => {
    const todoItem = document.createElement('div');
    todoItem.className = `flex items-center justify-between p-4 rounded-lg shadow-md ${todo.status === 'completed' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-white border-l-4 border-blue-500'}`;
    todoItem.innerHTML = `
      <div class="flex-grow">
        <h4 class="text-lg font-semibold text-gray-800 ${todo.status === 'completed' ? 'line-through text-gray-500' : ''}">${todo.title}</h4>
        ${todo.description ? `<p class="text-sm text-gray-600 mt-1">${todo.description}</p>` : ''}
        <p class="text-xs text-gray-400 mt-2">Created: ${new Date(todo.createdAt).toLocaleString()}</p>
      </div>
      <div class="flex items-center space-x-2 ml-4">
        <button class="toggle-status-button p-2 rounded-full ${todo.status === 'completed' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition duration-300" data-todo-id="${todo.todoId}" data-current-status="${todo.status}">${todo.status === 'completed' ? 'Undo' : 'Done'}</button>
        <button class="delete-todo-button p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition duration-300" data-todo-id="${todo.todoId}">Delete</button>
      </div>
    `;
    todoList.appendChild(todoItem);
  });
  document.querySelectorAll('.toggle-status-button').forEach(button => {
    button.addEventListener('click', (event) => {
      updateTodoStatus(event.target.dataset.todoId, event.target.dataset.currentStatus);
    });
  });
  document.querySelectorAll('.delete-todo-button').forEach(button => {
    button.addEventListener('click', (event) => {
      deleteTodo(event.target.dataset.todoId);
    });
  });
}
