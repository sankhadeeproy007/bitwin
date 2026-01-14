import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  // TODO: Implement place-guess business logic

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Guess placed successfully',
      // echo back any useful info for now
      input: event,
    }),
  };
};

