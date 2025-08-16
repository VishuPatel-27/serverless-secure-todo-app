// Import necessary AWS Amplify modules according to the latest best practices
import { Amplify } from 'aws-amplify';

// --- Amplify configuration ---
const awsConfig = {
    Auth: {
        Cognito: {
            // Use environment variables for sensitive information
            userPoolId: process.env.USERPOOL_ID,
            userPoolClientId: process.env.USERPOOL_CLIENT_ID,
        },
    },
    API: {
        REST: {
            TodoApi: {
                // Use environment variables for API endpoint and region
                endpoint: process.env.APIENDPOINT,
                region: process.env.AWS_REGION,
            },
        },
    },
};

export function configureAmplify() {
    // Configure Amplify with the AWS configuration
    Amplify.configure(awsConfig);
}
