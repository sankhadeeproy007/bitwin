import type { Handler } from "aws-lambda";
import {
  ActiveGuess,
  Player,
  getCurrentBitcoinPrice,
  getGraphQLConfigOrError,
  graphqlRequest,
} from "../shared/utils";
import {
  GET_PLAYER_QUERY,
  UPDATE_PLAYER_ACTIVE_GUESS_MUTATION,
} from "../shared/graphql";

interface PlaceGuessEvent {
  userId: string;
  guess: "up" | "down";
}

export const handler: Handler = async (event) => {
  try {
    const body: PlaceGuessEvent =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const { userId, guess } = body;

    if (!userId || !guess) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields: userId and guess",
        }),
      };
    }

    if (guess !== "up" && guess !== "down") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Guess must be either 'up' or 'down'",
        }),
      };
    }

    const configResult = getGraphQLConfigOrError();
    if ("statusCode" in configResult) {
      return configResult;
    }
    const { endpoint: graphqlEndpoint, apiKey } = configResult;

    let playerData: Player;
    try {
      const result = await graphqlRequest(
        GET_PLAYER_QUERY,
        { userId },
        graphqlEndpoint,
        apiKey
      );
      const fetchedPlayer = result.getPlayer as Player | null;
      if (!fetchedPlayer) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: "Player not found",
          }),
        };
      }
      playerData = fetchedPlayer;
    } catch (error) {
      console.error("Error fetching player:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to fetch player data",
        }),
      };
    }

    // Check if there's an active unresolved guess
    if (playerData.activeGuess) {
      const activeGuess: ActiveGuess = JSON.parse(
        typeof playerData.activeGuess === "string"
          ? playerData.activeGuess
          : JSON.stringify(playerData.activeGuess)
      );

      if (!activeGuess.resolved) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error:
              "Player already has an active guess. Please wait for it to be resolved.",
            activeGuess: {
              direction: activeGuess.direction,
              timestamp: activeGuess.timestamp,
            },
          }),
        };
      }
    }

    const currentPrice = await getCurrentBitcoinPrice();

    const timestamp = new Date().toISOString();
    const newActiveGuess: ActiveGuess = {
      direction: guess,
      timestamp,
      priceAtGuess: currentPrice,
      resolved: false,
    };

    const mutationResult = await graphqlRequest(
      UPDATE_PLAYER_ACTIVE_GUESS_MUTATION,
      {
        userId,
        activeGuess: JSON.stringify(newActiveGuess),
      },
      graphqlEndpoint,
      apiKey
    );

    const updatedPlayer = mutationResult.updatePlayer as Player;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Guess placed successfully",
        player: {
          userId: updatedPlayer.userId,
          score: updatedPlayer.score,
          activeGuess: newActiveGuess,
        },
      }),
    };
  } catch (error) {
    console.error("Error in place-guess handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
    };
  }
};
