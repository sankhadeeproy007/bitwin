import { useState, useEffect, useMemo } from "react";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const useBitcoinPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formattedPrice = useMemo(() => {
    return price !== null ? formatPrice(price) : null;
  }, [price]);

  useEffect(() => {
    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

    ws.onopen = () => {
      setLoading(false);
      setError(null);
      ws.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: ["BTC-USD"],
          channels: ["ticker"],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ticker" && data.price) {
        setPrice(parseFloat(data.price));
        setLoading(false);
        setError(null);
      }
    };

    ws.onerror = () => {
      setError("Failed to connect to price feed");
      setLoading(false);
    };

    ws.onclose = () => {
      setError("Connection closed");
      setLoading(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return { price, formattedPrice, loading, error };
};
