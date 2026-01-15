const BITCOIN_API_URL = "https://api.coinbase.com/v2/prices/BTC-USD/spot";

export interface ActiveGuess {
  direction: "up" | "down";
  timestamp: string;
  priceAtGuess: number;
  resolved: boolean;
}

export interface Player {
  userId: string;
  score: number;
  activeGuess: string | ActiveGuess | null;
}

/**
 * Fetches current Bitcoin price from Coinbase API
 */
export async function getCurrentBitcoinPrice(): Promise<number> {
  try {
    const response = await fetch(BITCOIN_API_URL);
    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.statusText}`);
    }
    const data = await response.json();
    return parseFloat(data.data.amount);
  } catch (error) {
    console.error("Error fetching Bitcoin price:", error);
    throw new Error("Failed to fetch Bitcoin price");
  }
}

/**
 * Makes a GraphQL request to the Amplify Data API
 */
export async function graphqlRequest(
  query: string,
  variables: Record<string, unknown>,
  endpoint: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

export function getGraphQLConfig(): { endpoint: string; apiKey: string } {
  const endpoint =
    process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT || process.env.GRAPHQL_ENDPOINT;
  const apiKey = process.env.AMPLIFY_DATA_API_KEY || process.env.API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "GraphQL endpoint or API key not configured. Please set AMPLIFY_DATA_GRAPHQL_ENDPOINT and AMPLIFY_DATA_API_KEY environment variables."
    );
  }

  return { endpoint, apiKey };
}

export function getGraphQLConfigOrError():
  | { endpoint: string; apiKey: string }
  | { statusCode: number; body: string } {
  try {
    return getGraphQLConfig();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: errorMessage,
      }),
    };
  }
}
