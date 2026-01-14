import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { placeGuess } from "./functions/place-guess/resource";
import { resolveGuess } from "./functions/resolve-guess/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  data,
  placeGuess,
  resolveGuess,
});
