/**
 * This test checks that the Amplify.configure function is called with the expected configuration.
 */
import { Amplify } from 'aws-amplify';
import { configureAmplify } from '../frontend-src/amplifyConfig.js';

jest.mock('aws-amplify');
jest.mock('@aws-amplify/auth');
jest.mock('@aws-amplify/api');

describe('configureAmplify', () => {
  it('calls Amplify.configure with expected config', () => {
    configureAmplify();
    expect(Amplify.configure).toHaveBeenCalled();
    const configArg = Amplify.configure.mock.calls[0][0];
    expect(configArg).toHaveProperty('Auth');
    expect(configArg).toHaveProperty('API');
  });
});
