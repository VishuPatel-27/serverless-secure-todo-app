/**
 * This module handles user authentication using AWS Amplify Auth.
 * It provides functions for signing up, signing in, confirming sign up,
 * signing out, and checking user authentication status.
 */
import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  getCurrentUser
} from '@aws-amplify/auth';

import { showTodoApp, showAuthSection } from './uiHandlers.js';

/**
 * This function sets up event listeners for sign up, sign in,
 * confirmation code input, and toggling between sign up and sign in modes.
 * It also manages the display of messages and UI elements based on authentication state.
 * @param {Object} params - The parameters for initializing auth handlers.
 * @param {HTMLInputElement} params.emailInput - The input field for the user's email.
 * @param {HTMLInputElement} params.passwordInput - The input field for the user's password.
 * @param {HTMLButtonElement} params.signupButton - The button to trigger sign up.
 * @param {HTMLButtonElement} params.signinButton - The button to trigger sign in.
 * @param {HTMLInputElement} params.confirmationCodeInput - The input field for the confirmation code.
 * @param {HTMLElement} params.authMessage - The element to display authentication messages.
 * @param {HTMLElement} params.authHeading - The heading element for the authentication section.
 * @param {HTMLButtonElement} params.toggleAuthModeButton - The button to toggle between
 * sign up and sign in modes.
 * @param {HTMLElement} params.confirmationCodeSection - The section for confirmation code input. 
 * @returns {Object} An object containing functions to handle authentication actions:
 * - toggleAuthMode: Toggles between sign up and sign in modes.
 * - handleSignUp: Handles user sign up.
 * - handleConfirmSignUp: Handles confirmation of sign up with a confirmation code.
 * - handleSignIn: Handles user sign in.
 * - handleSignOut: Handles user sign out.
 * - checkUserAuth: Checks if a user is already authenticated.
 * @throws {Error} Throws an error if any authentication operation fails.
 */
export function initAuthHandlers({
  emailInput,
  passwordInput,
  signupButton,
  signinButton,
  confirmationCodeInput,
  authMessage,
  authHeading,
  toggleAuthModeButton,
  confirmationCodeSection
}) {
  let isSignInMode = false;

  function toggleAuthMode() {
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
    authMessage.textContent = '';
  }

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
      const { userId, nextStep } = await signUp({
        username: email,
        password: password,
        options: { userAttributes: { email } },
      });
      console.log('Sign up response:', userId, nextStep);
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        authMessage.textContent = 'Sign up successful! Check your email for a confirmation code.';
        authMessage.className = 'text-sm mt-4 text-center text-green-500';
        confirmationCodeSection.classList.remove('hidden');
        signupButton.classList.add('hidden');
      } else {
        authMessage.textContent = `Sign up next step: ${nextStep.signUpStep}`;
        authMessage.className = 'text-sm mt-4 text-center text-orange-500';
      }
    } catch (error) {
      console.error('Sign up error:', error);
      authMessage.textContent = `Sign up failed!`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

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
      await confirmSignUp({ username: email, confirmationCode });
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
      authMessage.textContent = `Confirmation failed, please check your code and try again.`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

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
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      console.log('Sign in response:', isSignedIn, nextStep);
      if (isSignedIn) {
        authMessage.textContent = 'Signed in successfully!';
        authMessage.className = 'text-sm mt-4 text-center text-green-500';
        showTodoApp();
      } else {
        authMessage.textContent = `Sign in failed! Please check your credentials and try again.`;
        authMessage.className = 'text-sm mt-4 text-center text-orange-500';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      authMessage.textContent = `Sign In failed: ${error.message || 'Unknown error'}`;
      authMessage.className = 'text-sm mt-4 text-center text-red-500';
    }
  }

  async function handleSignOut(todoList) {
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

  async function checkUserAuth() {
    try {
      await getCurrentUser();
      console.log('User is already authenticated.');
      showTodoApp();
    } catch {
      console.log('No authenticated user. Showing auth section.');
      showAuthSection();
    }
  }

  return {
    toggleAuthMode,
    handleSignUp,
    handleConfirmSignUp,
    handleSignIn,
    handleSignOut,
    checkUserAuth
  };
}
