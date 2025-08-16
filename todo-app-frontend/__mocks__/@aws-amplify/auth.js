/**
 * Mock implementation of AWS Amplify Auth module for testing purposes.
 * This file is used to mock the authentication calls made by the todo app frontend.
 */
export const signUp = jest.fn(() => Promise.resolve({ userId: 'mockUser', nextStep: { signUpStep: 'DONE' }}));
export const signIn = jest.fn(() => Promise.resolve({ isSignedIn: true, nextStep: null }));
export const signOut = jest.fn(() => Promise.resolve());
export const confirmSignUp = jest.fn(() => Promise.resolve());
export const getCurrentUser = jest.fn(() => Promise.resolve({ username: 'mockUser' }));
export const fetchAuthSession = jest.fn(() =>
  Promise.resolve({
    tokens: {
      idToken: {
        toString: () => 'mock-id-token',
      },
    },
  })
);
