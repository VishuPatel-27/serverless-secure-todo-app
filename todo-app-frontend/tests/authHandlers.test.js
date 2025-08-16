/**
 * Test suite for authHandlers.js
 * This suite tests the authentication handlers for the Todo App frontend.
 * It includes tests for sign up, sign in, confirmation, and sign out functionalities.
 * Each test checks the expected behavior of the handlers, including error handling and UI updates.
 * It uses Jest for mocking dependencies and verifying interactions.
 * The tests ensure that the authentication flow works correctly and that the UI reflects the current authentication state.
 */
import { initAuthHandlers } from '../frontend-src/authHandlers.js';
import * as Auth  from '@aws-amplify/auth';
import { showTodoApp, showAuthSection } from '../frontend-src/uiHandlers.js';

jest.mock('aws-amplify');
jest.mock('@aws-amplify/auth');
jest.mock('@aws-amplify/api');
jest.mock('../frontend-src/uiHandlers.js');


describe('initAuthHandlers', () => {
  let authElements;

  beforeEach(() => {
    authElements = {
      emailInput: { value: 'test@example.com' },
      passwordInput: { value: 'password123' },
      signupButton: { classList: { add: jest.fn(), remove: jest.fn() } },
      signinButton: { classList: { add: jest.fn(), remove: jest.fn() } },
      confirmSignupButton: { classList: { add: jest.fn(), remove: jest.fn() } },
      confirmationCodeInput: { value: '123456' },
      authMessage: { textContent: '', className: '' },
      authHeading: { textContent: '' },
      toggleAuthModeButton: { textContent: '' },
      confirmationCodeSection: { classList: { add: jest.fn(), remove: jest.fn() } },
    };
  });

  describe('handleSignUp', () => {
    it('displays error if email or password missing', async () => {
      authElements.emailInput.value = '';
      const { handleSignUp } = initAuthHandlers(authElements);
      await handleSignUp();
      expect(authElements.authMessage.textContent).toBe('Email and Password are required.');
    });

    it('calls Auth.signUp and shows success message on confirmation step', async () => {
      Auth.signUp.mockResolvedValue({
        userId: 'user123',
        nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
      });
      const { handleSignUp } = initAuthHandlers(authElements);
      await handleSignUp();
     /* eslint-disable sonarjs/no-hardcoded-passwords */
      expect(Auth.signUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
        options: { userAttributes: { email: 'test@example.com' } },
      });
      expect(authElements.authMessage.textContent).toContain('Sign up successful!');
      expect(authElements.confirmationCodeSection.classList.remove).toHaveBeenCalled();
    });

    it('displays error message on signUp failure', async () => {
      Auth.signUp.mockRejectedValue(new Error('Fail'));
      const { handleSignUp } = initAuthHandlers(authElements);
      await handleSignUp();
      expect(authElements.authMessage.textContent).toContain('Sign up failed!');
    });
  });

  describe('handleConfirmSignUp', () => {
    it('displays error if email or confirmation code missing', async () => {
      authElements.confirmationCodeInput.value = '';
      const { handleConfirmSignUp } = initAuthHandlers(authElements);
      await handleConfirmSignUp();
      expect(authElements.authMessage.textContent).toBe('Email and Confirmation Code are required.');
    });

    it('calls Auth.confirmSignUp and switches to signIn mode on success', async () => {
      Auth.confirmSignUp.mockResolvedValue();
      const { handleConfirmSignUp } = initAuthHandlers(authElements);
      await handleConfirmSignUp();
      expect(Auth.confirmSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        confirmationCode: '123456',
      });
      expect(authElements.authMessage.textContent).toContain('Account confirmed successfully');
      expect(authElements.authHeading.textContent).toBe('Sign In');
    });

    it('shows error message on confirmation failure', async () => {
      Auth.confirmSignUp.mockRejectedValue(new Error('Error'));
      const { handleConfirmSignUp } = initAuthHandlers(authElements);
      await handleConfirmSignUp();
      expect(authElements.authMessage.textContent).toContain('Confirmation failed');
    });
  });

  describe('handleSignIn', () => {
    it('displays error if email or password missing', async () => {
      authElements.emailInput.value = '';
      const { handleSignIn } = initAuthHandlers(authElements);
      await handleSignIn();
      expect(authElements.authMessage.textContent).toBe('Email and Password are required.');
    });

    it('calls Auth.signIn and shows todo app on success', async () => {
      Auth.signIn.mockResolvedValue({ isSignedIn: true });
      const { handleSignIn } = initAuthHandlers(authElements);
      await handleSignIn();
      expect(Auth.signIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
      });
      expect(authElements.authMessage.textContent).toContain('Signed in successfully!');
      expect(showTodoApp).toHaveBeenCalled();
    });

    it('shows error on signIn failure', async () => {
      Auth.signIn.mockRejectedValue(new Error('Fail'));
      const { handleSignIn } = initAuthHandlers(authElements);
      await handleSignIn();
      expect(authElements.authMessage.textContent).toContain('Sign In failed');
    });
  });

  describe('handleSignOut', () => {
    it('calls Auth.signOut and shows auth section on success', async () => {
      Auth.signOut.mockResolvedValue();
      const todoList = { innerHTML: '' };
      const { handleSignOut } = initAuthHandlers(authElements);
      await handleSignOut(todoList);
      expect(Auth.signOut).toHaveBeenCalled();
      expect(authElements.authMessage.textContent).toContain('Signed out successfully.');
      expect(showAuthSection).toHaveBeenCalled();
      expect(todoList.innerHTML).toContain('Loading To-Dos...');
    });

    it('shows error on signOut failure', async () => {
      Auth.signOut.mockRejectedValue(new Error('Fail'));
      const todoList = { innerHTML: '' };
      const { handleSignOut } = initAuthHandlers(authElements);
      await handleSignOut(todoList);
      expect(authElements.authMessage.textContent).toContain('Sign Out failed');
    });
  });

  describe('toggleAuthMode', () => {
    it('toggles mode and updates UI texts', () => {
      const { toggleAuthMode } = initAuthHandlers(authElements);
      toggleAuthMode(); // to sign in mode
      expect(authElements.authHeading.textContent).toBe('Sign In');
      toggleAuthMode(); // back to sign up mode
      expect(authElements.authHeading.textContent).toBe('Sign Up');
    });
  });

  describe('checkUserAuth', () => {
    it('shows todo app if user is authenticated', async () => {
      Auth.getCurrentUser.mockResolvedValue({});
      const { checkUserAuth } = initAuthHandlers(authElements);
      await checkUserAuth();
      expect(showTodoApp).toHaveBeenCalled();
    });

    it('shows auth section if no authenticated user', async () => {
      Auth.getCurrentUser.mockRejectedValue(new Error('No user'));
      const { checkUserAuth } = initAuthHandlers(authElements);
      await checkUserAuth();
      expect(showAuthSection).toHaveBeenCalled();
    });
  });
});
