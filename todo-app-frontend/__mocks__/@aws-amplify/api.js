/**
 * Mock implementation of AWS Amplify API module for testing purposes.
 * This file is used to mock the API calls made by the todo app frontend.
 * It provides mock functions for GET, POST, PUT, and DELETE requests.
 */
export const get = jest.fn(() => Promise.resolve({
  response: Promise.resolve({
    body: {
      json: () => Promise.resolve({ todos: [] }),
    },
  }),
}));
export const post = jest.fn(() => Promise.resolve({
  response: Promise.resolve({
    body: {
      json: () => Promise.resolve({ success: true }),
    },
  }),
}));
export const put = jest.fn(() => Promise.resolve({
  response: Promise.resolve({
    body: {
      json: () => Promise.resolve({ success: true }),
    },
  }),
}));
export const del = jest.fn(() => Promise.resolve({
  response: Promise.resolve({
    body: {
      json: () => Promise.resolve({ success: true }),
    },
  }),
}));
