import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "amplifyNotesDrive",
  access: (allow) => ({
    "public/profile-pics/*": [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write"]),
    ],
  }),
});