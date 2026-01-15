import type { PostConfirmationTriggerHandler } from "aws-lambda";
import { getGraphQLConfigOrError, graphqlRequest } from "../shared/utils";
import { CREATE_PLAYER_MUTATION } from "../shared/graphql";

export const handler: PostConfirmationTriggerHandler = async (event) => {
  try {
    const userId = event.request.userAttributes.sub;
    const configResult = getGraphQLConfigOrError();
    if ("statusCode" in configResult) {
      console.error("GraphQL config error:", configResult);
      return event;
    }
    const { endpoint, apiKey } = configResult;

    await graphqlRequest(
      CREATE_PLAYER_MUTATION,
      {
        userId,
        score: 0,
      },
      endpoint,
      apiKey
    );

    console.log(`Player created for user: ${userId}`);
  } catch (error) {
    console.error("Error creating player in post-confirmation:", error);
  }

  return event;
};
