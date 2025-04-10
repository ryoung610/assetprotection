import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    "custom:username": { dataType: "String", mutable: true },
    phoneNumber: {  mutable: true },
  },
});