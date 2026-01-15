import { defineAuth } from "@aws-amplify/backend";
import { preSignUp } from "../functions/pre-sign-up/resource";
import { postConfirmation } from "../functions/post-confirmation/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    "custom:username": {
      dataType: "String",
      mutable: true,
    },
  },
  accountRecovery: "EMAIL_ONLY",
  triggers: {
    preSignUp: preSignUp,
    postConfirmation: postConfirmation,
  },
});
