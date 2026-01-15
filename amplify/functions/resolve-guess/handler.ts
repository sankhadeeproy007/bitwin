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
  UPDATE_PLAYER_SCORE_AND_GUESS_MUTATION,
} from "../shared/graphql";

interface ResolveGuessEvent {
  userId: string;
}

const MIN_TIME_ELAPSED = 60;

function hasEnoughTimeElapsed(guess: ActiveGuess): boolean {
  const guessTime = new Date(guess.timestamp).getTime();
  const now = Date.now();
  const secondsElapsed = (now - guessTime) / 1000;
  return secondsElapsed >= MIN_TIME_ELAPSED;
}

function hasPriceChanged(guess: ActiveGuess, currentPrice: number): boolean {
  return currentPrice !== guess.priceAtGuess;
}

function isGuessCorrect(guess: ActiveGuess, currentPrice: number): boolean {
  if (guess.direction === "up") {
    return currentPrice > guess.priceAtGuess;
  } else {
    return currentPrice < guess.priceAtGuess;
  }
}

export const handler: Handler = async (event) => {
  try {
    const body: ResolveGuessEvent =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};

    const { userId } = body;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required field: userId",
        }),
      };
    }

    const configResult = getGraphQLConfigOrError();
    if ("statusCode" in configResult) {
      return configResult;
    }
    const { endpoint: graphqlEndpoint, apiKey } = configResult;

    let player: Player;
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
      player = fetchedPlayer;
    } catch (error) {
      console.error("Error fetching player:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to fetch player data",
        }),
      };
    }

    if (!player.activeGuess) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Player does not have an active guess",
        }),
      };
    }

    let activeGuess: ActiveGuess;
    try {
      activeGuess = JSON.parse(
        typeof player.activeGuess === "string"
          ? player.activeGuess
          : JSON.stringify(player.activeGuess)
      );
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid active guess data",
        }),
      };
    }

    if (activeGuess.resolved) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Guess has already been resolved",
        }),
      };
    }

    if (!hasEnoughTimeElapsed(activeGuess)) {
      const guessTime = new Date(activeGuess.timestamp).getTime();
      const now = Date.now();
      const secondsElapsed = (now - guessTime) / 1000;
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Not enough time has elapsed",
          message: `Only ${Math.floor(secondsElapsed)} seconds have passed. Need at least ${MIN_TIME_ELAPSED} seconds.`,
          secondsElapsed: Math.floor(secondsElapsed),
          requiredSeconds: MIN_TIME_ELAPSED,
        }),
      };
    }

    const currentPrice = await getCurrentBitcoinPrice();

    if (!hasPriceChanged(activeGuess, currentPrice)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Price has not changed since the guess was placed",
          message: "Guess can only be resolved when the price changes",
          priceAtGuess: activeGuess.priceAtGuess,
          currentPrice,
        }),
      };
    }

    const wasCorrect = isGuessCorrect(activeGuess, currentPrice);
    const scoreChange = wasCorrect ? 1 : -1;
    const newScore = (player.score || 0) + scoreChange;

    const resolvedGuess: ActiveGuess = {
      ...activeGuess,
      resolved: true,
    };

    try {
      await graphqlRequest(
        UPDATE_PLAYER_SCORE_AND_GUESS_MUTATION,
        {
          userId: player.userId,
          score: newScore,
          activeGuess: JSON.stringify(resolvedGuess),
        },
        graphqlEndpoint,
        apiKey
      );
    } catch (error) {
      console.error("Error updating player:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to update player data",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Guess resolved successfully",
        result: {
          userId: player.userId,
          wasCorrect,
          scoreChange,
          newScore,
          priceAtGuess: activeGuess.priceAtGuess,
          currentPrice,
          direction: activeGuess.direction,
        },
      }),
    };
  } catch (error) {
    console.error("Error in resolve-guess handler:", error);
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
