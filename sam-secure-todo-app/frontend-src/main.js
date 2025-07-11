// frontend-src/main.js
/**
 * Main entry point for the Secure To-Do App
 * This script initializes AWS Amplify, sets up authentication,
 * and handles user interactions for signing up, signing in, and managing To-Do items.
 * @module main
 * @requires aws-amplify
 * @requires @aws-amplify/auth
 * 
 */

// Import necessary AWS Amplify modules according to the latest best practices
import { Amplify } from 'aws-amplify';
import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession
} from '@aws-amplify/auth';
import {
  get,
  post,
  put,
  del
} from '@aws-amplify/api';

// --- Amplify configuration ---
const awsConfig = {
  Auth: {
    Cognito: {

      // Use environment variables for sensitive information
      userPoolId: process.env.VITE_APP_USER_POOL_ID,
      userPoolClientId: process.env.VITE_APP_USER_POOL_CLIENT_ID,
    },
  },
  API: {
    REST: {
      TodoApi: {
        // Use environment variables for API endpoint and region
        endpoint: process.env.VITE_APP_API_ENDPOINT,
        region: process.env.VITE_APP_AWS_REGION,
      },
    },
  },
};

// Configure Amplify with the AWS configuration
Amplify.configure(awsConfig);

// Wrap all your application logic in a DOMContentLoaded listener.
// This ensures the entire HTML document is loaded and parsed,
// and all external scripts (like Amplify) are available before code runs.
// document is a global object representing the HTML document.
document.addEventListener('DOMContentLoaded', () => {

  // Configure Amplify
  Amplify.configure(awsConfig);

  // --- DOM Elements ---
  const authSection = document.getElementById('auth-section');
  const authHeading = document.getElementById('auth-heading');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signupButton = document.getElementById('signup-button');
  const signinButton = document.getElementById('signin-button');
  const toggleAuthModeButton = document.getElementById('toggle-auth-mode');
  const authMessage = document.getElementById('auth-message');
  const confirmationCodeSection = document.getElementById('confirmation-code-section');
  const confirmationCodeInput = document.getElementById('confirmation-code');
  const confirmSignupButton = document.getElementById('confirm-signup-button');

  const todoAppSection = document.getElementById('todo-app-section');
  const signoutButton = document.getElementById('signout-button');
  const newTodoTitleInput = document.getElementById('new-todo-title');
  const newTodoDescriptionInput = document.getElementById('new-todo-description');
  const addTodoButton = document.getElementById('add-todo-button');
  const todoList = document.getElementById('todo-list');
  const todoMessage = document.getElementById('todo-message');

  let isSignInMode = false; // Tracks current auth form mode

  // --- Event Listeners ---

  toggleAuthModeButton.addEventListener('click', () => {
    isSignInMode = !isSignInMode;
    if (isSignInMode) {
      authHeading.textContent = 'Sign In';
      signupButton.classList.add('hidden');
      signinButton.classList.remove('hidden');
      toggleAuthModeButton.textContent = "Don't have an account? Sign Up";
      confirmationCodeSection.classList.add('hidden');
    } else {
      authHeading.textContent = 'Sign Up';
      signupButton.classList.remove('hidden');
      signinButton.classList.add('hidden');
      toggleAuthModeButton.textContent = "Already have an account? Sign In";
      confirmationCodeSection.classList.add('hidden');
    }
    authMessage.textContent = ''; // Clear message on mode change
  });

  signupButton.addEventListener('click', handleSignUp);
  signinButton.addEventListener('click', handleSignIn);
  confirmSignupButton.addEventListener('click', handleConfirmSignUp);
  signoutButton.addEventListener('click', handleSignOut);
  addTodoButton.addEventListener('click', createTodo);

  /**
   * 
   * Handles user sign-up by collecting email and password,
   * validating input, and calling the signUp function from Amplify Auth.
   * displays appropriate messages based on success or failure.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @throws Will throw an error if sign-up fails.
   * @returns {Promise<void>}
   *
   */
  async function handleSignUp() {
    const email = emailInput.value;
    const password = passwordInput.value;
    authMessage.textContent = '';
    if (!email || !password) {
      authMessage.textContent = 'Email and Password are required.';
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
      return;
    }

    try {
      const { userNextSteps } = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        },
      });
      console.log('Sign up response:', userNextSteps);

      if (userNextSteps.signUpStep === 'CONFIRM_SIGN_UP') {
        authMessage.textContent = 'Sign up successful! Check your email for a confirmation code.';
        authMessage.className = 'text-sm mt-4 text-center text-green-500';
        confirmationCodeSection.classList.remove('hidden');
        signupButton.classList.add('hidden');
      } else {
        authMessage.textContent = 'Sign up successful, but unexpected next step. Please check console.';
        authMessage.className = 'text-sm mt-4 text-center text-orange-500';
      }
    } catch (error) {
      console.error('Sign up error:', error);
      authMessage.textContent = `Sign Up failed: ${error.message || 'Unknown error'}`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * 
   * Handles user confirmation of sign-up by collecting email and confirmation code,
   * validating input, and calling the confirmSignUp function from Amplify Auth.
   * Displays appropriate messages based on success or failure.
   * @throws Will throw an error if confirmation fails.
   * @param {string} email - User's email address.
   * @param {string} confirmationCode - Confirmation code sent to the user's email.
   * @returns {Promise<void>}
   */
  async function handleConfirmSignUp() {
    const email = emailInput.value;
    const confirmationCode = confirmationCodeInput.value;
    authMessage.textContent = '';
    if (!email || !confirmationCode) {
      authMessage.textContent = 'Email and Confirmation Code are required.';
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
      return;
    }

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });
      authMessage.textContent = 'Account confirmed successfully! You can now sign in.';
      authMessage.className = 'text-sm mt-4 text-center text-green-500';
      isSignInMode = true;
      authHeading.textContent = 'Sign In';
      signupButton.classList.add('hidden');
      signinButton.classList.remove('hidden');
      toggleAuthModeButton.textContent = "Don't have an account? Sign Up";
      confirmationCodeSection.classList.add('hidden');
    } catch (error) {
      console.error('Confirm sign up error:', error);
      authMessage.textContent = `Confirmation failed: ${error.message || 'Unknown error'}`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * 
   * Handles user sign-in by collecting email and password,
   * validating input, and calling the signIn function from Amplify Auth.
   * Displays appropriate messages based on success or failure.
   * @param {string} email - User's email address.
   * @param {string} password - User's password.
   * @throws Will throw an error if sign-in fails.
   * @returns {Promise<void>}
   */
  async function handleSignIn() {
    const email = emailInput.value;
    const password = passwordInput.value;
    authMessage.textContent = '';
    if (!email || !password) {
      authMessage.textContent = 'Email and Password are required.';
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
      return;
    }

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password,
      });
      console.log('Sign in response:', isSignedIn, nextStep);

      if (isSignedIn) {
        authMessage.textContent = 'Signed in successfully!';
        authMessage.className = 'text-sm mt-4 text-center text-green-500';
        showTodoApp();
      } else {
        authMessage.textContent = `Sign in failed: ${nextStep.signInStep || 'Unknown error'}`;
        authMessage.className = 'text-sm mt-4 text-center text-orange-500';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      authMessage.textContent = `Sign In failed: ${error.message || 'Unknown error'}`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * Handles user sign-out by calling the signOut function from Amplify Auth.
   * Displays appropriate messages based on success or failure.
   * @throws Will throw an error if sign-out fails.
   * @returns {Promise<void>}
   * 
   */
  async function handleSignOut() {
    try {
      await signOut();
      authMessage.textContent = 'Signed out successfully.';
      authMessage.className = 'text-sm mt-4 text-center text-green-500';
      showAuthSection();
      todoList.innerHTML = '<p class="text-gray-500 text-center">Loading To-Dos...</p>';
    } catch (error) {
      console.error('Sign out error:', error);
      authMessage.textContent = `Sign Out failed: ${error.message || 'Unknown error'}`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * Shows the To-Do application section,
   * hides the authentication section, and fetches existing To-Do items.
   * @returns {void}
  */
  function showTodoApp() {
    authSection.classList.add('hidden');
    todoAppSection.classList.remove('hidden');
    fetchTodos();
  }

  /**
   * Shows the authentication section,
   * hides the To-Do application section, and resets the form fields.
   * @returns {void}
   * 
   */
  function showAuthSection() {
    authSection.classList.remove('hidden');
    todoAppSection.classList.add('hidden');
    isSignInMode = false;
    authHeading.textContent = 'Sign In';
    signinButton.classList.remove('hidden');
    signupButton.classList.add('hidden');
    toggleAuthModeButton.textContent = "Don't have an account? Sign Up";
    confirmationCodeSection.classList.add('hidden');
    emailInput.value = '';
    passwordInput.value = '';
    confirmationCodeInput.value = '';
    authMessage.textContent = '';
  }

  /**
   * 
   * @returns {Promise<void>}
   * Handles the creation of a new To-Do item by collecting title and description,
   * validating input, and calling the post function from Amplify API.
   * Displays appropriate messages based on success or failure.
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

      const apiName = 'TodoApi';
      const path = '/todos';
      const result  = await post({
        apiName,
        path,
        options: {
          body: { title, description },
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      });
      
      // Log the result for debugging
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
   * Fetches the list of To-Do items from the API,
   * displays a loading message while fetching,
   * and renders the To-Do items once fetched.
   * if no To-Dos are found, displays an appropriate message.
   * @returns {Promise<void>}
   * 
   */
  async function fetchTodos() {
    todoList.innerHTML = '<p class="text-gray-500 text-center">Loading To-Dos...</p>'; // Show loading
    try {

      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();

      const apiName = 'TodoApi';
      const path = '/todos';
      const result = await get({
        apiName,
        path,
        options: {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      });

      console.log('Fetched To-Dos result:', result);
      const raw = await result.response;
      console.log('Fetched To-Dos raw response:', raw)
      const data = await raw.body.json();
      console.log('Fetched To-Dos data:', data);

      if(data.todos && data.todos.length > 0) {
        renderTodos(data.todos);
      }else{
        todoList.innerHTML = '<p class="text-green-500 text-center">No tasks for you, today!</p>';
        console.error('Invalid To-Do response format:', data);
      }

    } catch (error) {
      console.error('Error fetching To-Dos:', error);
      todoList.innerHTML = '<p class="text-red-500 text-center">Failed to load To-Dos. Please sign in again.</p>';
    }
  }

  /**
   *  
   * Handles updating the status of a To-Do item.
   * Toggles between 'pending' and 'completed' status.
   * Uses the put function from Amplify API to update the To-Do item.
   * Displays appropriate messages based on success or failure.
   * @param {string} todoId - The ID of the To-Do item to update.
   * @param {string} currentStatus - The current status of the To-Do item ('pending' or 'completed').
   * @returns {Promise<void>}
   */
  async function updateTodoStatus(todoId, currentStatus) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {

      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const apiName = 'TodoApi';
      const path = `/todos/${todoId}`;
      const result = await put({
        apiName,
        path,
        options: {
          body: { status: newStatus },
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      });
      const raw = await result.response;
      const data = await raw.body.json();
      // Log the result for debugging
      console.log(`To-Do ${todoId} status updated to ${newStatus}`, data);
      fetchTodos(); // Refresh list
    } catch (error) {
      console.error('Error updating To-Do status:', error);
      todoMessage.textContent = `Failed to update To-Do status: ${error.message || 'Unknown error'}`;
      todoMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * 
   * Handles the deletion of a To-Do item by its ID.
   * Uses the del function from Amplify API to delete the To-Do item.
   * Displays appropriate messages based on success or failure.
   * @param {string} todoId - The ID of the To-Do item to delete.
   * @throws Will throw an error if deletion fails.
   * @returns {Promise<void>}
   */
  async function deleteTodo(todoId) {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();
      const apiName = 'TodoApi';
      const path = `/todos/${todoId}`;
      const result = await del({
        apiName,
        path,
        options: {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      });
      const raw = await result.response;
      const data = await raw.body.json();
      console.log(`To-Do ${todoId} deleted successfully`, data);
      fetchTodos(); // Refresh list
    } catch (error) {
      console.error('Error deleting To-Do:', error);
      todoMessage.textContent = `Failed to delete To-Do: ${error.message || 'Unknown error'}`;
      todoMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  /**
   * Renders the list of To-Do items in the UI.
   * Clears existing list items, creates new ones based on the provided todos array,
   * and adds event listeners for status toggling and deletion.
   * If no To-Dos are found, displays a message indicating that there are no items
   * to display.
   * @param {Array} todos - Array of To-Do items to render.
   * @returns {void}
   */
  function renderTodos(todos) {
    todoList.innerHTML = ''; // Clear existing list items

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
                    <button class="toggle-status-button p-2 rounded-full ${todo.status === 'completed' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition duration-300" data-todo-id="${todo.todoId}" data-current-status="${todo.status}">
                        ${todo.status === 'completed' ? 'Undo' : 'Done'}
                    </button>
                    <button class="delete-todo-button p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition duration-300" data-todo-id="${todo.todoId}">
                        Delete
                    </button>
                </div>
            `;
      todoList.appendChild(todoItem);
    });

    // Add event listeners to the newly created buttons
    document.querySelectorAll('.toggle-status-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const todoId = event.target.dataset.todoId;
        const currentStatus = event.target.dataset.currentStatus;
        updateTodoStatus(todoId, currentStatus);
      });
    });

    document.querySelectorAll('.delete-todo-button').forEach(button => {
      button.addEventListener('click', (event) => {
        const todoId = event.target.dataset.todoId;
        deleteTodo(todoId);
      });
    });
  }

  /** 
   * Checks if there is a currently authenticated user.
   * If a user is authenticated, it shows the To-Do app section.
   * If no user is authenticated, it shows the authentication section.
   * This is called when the DOM content is fully loaded to determine the initial state of the app.
   * @returns {Promise<void>}
   * 
  */
  getCurrentUser()
    .then(() => {
      console.log('User is already authenticated.');
      showTodoApp();
    })
    .catch(() => {
      console.log('No authenticated user. Showing auth section.');
      showAuthSection();
    });
});
