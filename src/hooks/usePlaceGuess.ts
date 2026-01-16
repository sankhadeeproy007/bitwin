import { useState } from "react";

interface PlaceGuessResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    score: number;
    activeGuess: {
      direction: "up" | "down";
      timestamp: string;
      priceAtGuess: number;
      resolved: boolean;
    };
  };
}

interface ErrorResponse {
  error: string;
  activeGuess?: {
    direction: string;
    timestamp: string;
    priceAtGuess: number;
  };
}

export const usePlaceGuess = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeGuess = async (
    userId: string,
    guess: "up" | "down"
  ): Promise<PlaceGuessResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const PLACE_GUESS_URL = import.meta.env.VITE_PLACE_GUESS_URL;

      if (!PLACE_GUESS_URL) {
        throw new Error("VITE_PLACE_GUESS_URL not configured");
      }

      const response = await fetch(PLACE_GUESS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, guess }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.error || "Failed to place guess");
        return null;
      }

      return data as PlaceGuessResponse;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to place guess";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { placeGuess, loading, error };
};
