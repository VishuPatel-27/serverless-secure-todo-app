/**
 * todoHandlers.js
 * @fileoverview
 * This module provides functions to handle To-Do operations in the application.
 * It includes creating, fetching, updating, and deleting To-Dos.
 * It uses AWS Amplify's API and Auth modules to interact with the backend.
 * The functions are designed to be used in a front-end application, managing the UI updates accordingly
 * and providing feedback to the user.
 * It also handles errors gracefully, displaying appropriate messages to the user.
 * @module todoHandlers
 * @requires @aws-amplify/auth
 * @requires @aws-amplify/api
 * @requires ./uiHandlers.js
 */
import { fetchAuthSession } from '@aws-amplify/auth';
import { get, post, put, del } from '@aws-amplify/api';
import { renderTodos } from './uiHandlers.js';

/**
 * Initializes the To-Do handlers with the provided input elements and message display.
 * @param {Object} params - The parameters for initializing the To-Do handlers.
 * @param {HTMLInputElement} params.newTodoTitleInput - Input element for the new To-Do title.
 * @param {HTMLInputElement} params.newTodoDescriptionInput - Input element for the new To-Do description.
 * @param {HTMLElement} params.todoMessage - Element to display messages related to To-Do operations.
 * @param {HTMLElement} params.todoList - Element to render the list of To-Dos.
 * @returns {Object} An object containing functions to create, fetch, update, and delete To-Dos.
 */
export function initTodoHandlers({ newTodoTitleInput, newTodoDescriptionInput, todoMessage, todoList }) {
  
  /**
   * Creates a new To-Do with the provided title and description.
   * Handles user input validation and API interaction.
   * Displays appropriate messages based on the operation's success or failure.
   * @returns {Promise<void>} A promise that resolves when the To-Do is created or an error occurs.
   * @throws {Error} Throws an error if the To-Do creation fails.
   */
  async function createTodo() {
    const title = newTodoTitleInput.value.trim();
    const description = newTodoDescriptionInput.value.trim();
    todoMessage.textContent = '';
    if (!title) {
      todoMessage.textContent = 'To-Do title cannot be empty.';
      todoMessage.className = 'text-sm mt-4 text-center text-red-500';
      return;
    }
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const result = await post({
        apiName: 'TodoApi',
        path: '/todos',
        options: {
          body: { title, description },
          headers: { Authorization: `Bearer ${idToken}` }
        }
      });
      const raw = await result.response;
      const data = await raw.body.json();
      console.log('Create To-Do response:', data);
      newTodoTitleInput.value = '';
      newTodoDescriptionInput.value = '';
      fetchTodos();
    } catch (error) {
      console.error('Error creating To-Do:', error);
      todoMessage.textContent = `Failed to create To-Do: ${error.message || 'Unknown error'}`;
      todoMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }
  /**
   * Fetches the list of To-Dos from the backend and renders them in the UI.
   * Displays a loading message while fetching and handles errors gracefully.
   * @returns {Promise<void>} A promise that resolves when the To-Dos are fetched or an error occurs.
   */
  async function fetchTodos() {
    todoList.innerHTML = '<p class="text-gray-500 text-center">Loading To-Dos...</p>';
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const result = await get({
        apiName: 'TodoApi',
        path: '/todos',
        options: { headers: { Authorization: `Bearer ${idToken}` } }
      });
      const raw = await result.response;
      const data = await raw.body.json();
      console.log('Fetched To-Dos data:', data);
      if (data.todos && data.todos.length > 0) {
        renderTodos(data.todos, updateTodoStatus, deleteTodo);
      } else {
        todoList.innerHTML = '<p class="text-green-500 text-center">No tasks for you, today!</p>';
      }
    } catch (error) {
      console.error('Error fetching To-Dos:', error);
      todoList.innerHTML = '<p class="text-red-500 text-center">Failed to load To-Dos. Please sign in again.</p>';
    }
  }

  /**
   * Updates the status of a To-Do item.
   * Toggles the status between 'pending' and 'completed'.
   * Handles API interaction and updates the UI accordingly.
   * @param {string} todoId - The ID of the To-Do item to update.
   * @param {string} currentStatus - The current status of the To-Do item.
   * @returns {Promise<void>} A promise that resolves when the To-Do status is updated or an error occurs.
   * @throws {Error} Throws an error if the To-Do status update fails.
   */
  async function updateTodoStatus(todoId, currentStatus) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const result = await put({
        apiName: 'TodoApi',
        path: `/todos/${todoId}`,
        options: {
          body: { status: newStatus },
          headers: { Authorization: `Bearer ${idToken}` }
        }
      });
      const raw = await result.response;
      const data = await raw.body.json();
      console.log(`To-Do ${todoId} status updated to ${newStatus}`, data);
      fetchTodos();
    } catch (error) {
      console.error('Error updating To-Do status:', error);
      todoMessage.textContent = `Failed to update To-Do status: ${error.message || 'Unknown error'}`;
      todoMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * Deletes a To-Do item by its ID.
   * Handles API interaction and updates the UI accordingly.
   * @param {string} todoId - The ID of the To-Do item to delete.
   * @returns {Promise<void>} A promise that resolves when the To-Do is deleted or an error occurs.
   * @throws {Error} Throws an error if the To-Do deletion fails. 
   */
  async function deleteTodo(todoId) {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const result = await del({
        apiName: 'TodoApi',
        path: `/todos/${todoId}`,
        options: { headers: { Authorization: `Bearer ${idToken}` } }
      });
      const raw = await result.response;
      const data = await raw.body.json();
      console.log(`To-Do ${todoId} deleted successfully`, data);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting To-Do:', error);
      todoMessage.textContent = `Failed to delete To-Do: ${error.message || 'Unknown error'}`;
      todoMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  return { createTodo, fetchTodos, updateTodoStatus, deleteTodo };
}
