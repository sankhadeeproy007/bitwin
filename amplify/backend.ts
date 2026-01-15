import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { placeGuess } from "./functions/place-guess/resource";
import { resolveGuess } from "./functions/resolve-guess/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */

export const backend = defineBackend({
  auth,
  data,
  placeGuess,
  resolveGuess,
});

// Remove password restrictions - allow any password
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 6,
    requireLowercase: false,
    requireNumbers: false,
    requireSymbols: false,
    requireUppercase: false,
  },
};
