// main.js
import { configureAmplify } from './amplifyConfig.js';
import { initAuthHandlers } from './authHandlers.js';
import { initTodoHandlers } from './todoHandlers.js';
import { setFetchTodos } from './uiHandlers.js';

document.addEventListener('DOMContentLoaded', () => {
  configureAmplify();

  const authElements = {
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    signupButton: document.getElementById('signup-button'),
    signinButton: document.getElementById('signin-button'),
    confirmSignupButton: document.getElementById('confirm-signup-button'),
    confirmationCodeInput: document.getElementById('confirmation-code'),
    authMessage: document.getElementById('auth-message'),
    authHeading: document.getElementById('auth-heading'),
    toggleAuthModeButton: document.getElementById('toggle-auth-mode'),
    confirmationCodeSection: document.getElementById('confirmation-code-section')
  };

  const todoElements = {
    newTodoTitleInput: document.getElementById('new-todo-title'),
    newTodoDescriptionInput: document.getElementById('new-todo-description'),
    todoMessage: document.getElementById('todo-message'),
    todoList: document.getElementById('todo-list')
  };

  const authHandlers = initAuthHandlers(authElements);
  const todoHandlers = initTodoHandlers(todoElements);

  setFetchTodos(todoHandlers.fetchTodos);

  authElements.signupButton.addEventListener('click', authHandlers.handleSignUp);
  authElements.signinButton.addEventListener('click', authHandlers.handleSignIn);
  authElements.confirmSignupButton.addEventListener('click', authHandlers.handleConfirmSignUp);
  authElements.toggleAuthModeButton.addEventListener('click', authHandlers.toggleAuthMode);
  document.getElementById('signout-button').addEventListener('click', () => authHandlers.handleSignOut(todoElements.todoList));
  document.getElementById('add-todo-button').addEventListener('click', todoHandlers.createTodo);

  authHandlers.checkUserAuth();
});
