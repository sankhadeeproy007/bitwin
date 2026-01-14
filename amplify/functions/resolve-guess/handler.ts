import type { Handler } from "aws-lambda";

export const handler: Handler = async (event) => {
  // TODO: Implement resolve-guess business logic

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Guess resolved successfully",
      // echo back any useful info for now
      input: event,
    }),
  };
};
