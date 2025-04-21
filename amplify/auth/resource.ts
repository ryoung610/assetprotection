import { defineAuth } from '@aws-amplify/backend';



export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Welcome to Asset ~ Protection!',
      verificationEmailBody: (createCode) => `Use this code to confirm your account: ${createCode()}`,
    },
  },
  userAttributes: {
    'custom:isSubscriber': {
      dataType: 'String',
      mutable: true,
    },
    'custom:username': {
      dataType: 'String',
      mutable: true,
      maxLen: 50, // Optional: limit username length
    },
    'custom:level': {
      dataType: 'String',
      mutable: true,
    },
    phoneNumber: {
      mutable: true,
      required: false, // Optional
    },
  },
});