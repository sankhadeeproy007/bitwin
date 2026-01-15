import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useBitcoinPrice } from "../hooks/useBitcoinPrice";
import "./Game.css";

const Game = () => {
  const { formattedPrice, loading, error } = useBitcoinPrice();

  const handlePlaceGuess = () => {
    // TODO: Implement guess placement logic
    console.log("Place guess clicked");
  };

  return (
    <Container maxWidth="md">
      <Box className="homePageContainer">
        <Typography variant="h3" component="h1" gutterBottom>
          Bitcoin Price Guessing Game
        </Typography>

        <Paper elevation={3} className="priceCard">
          <Typography variant="h6" color="primary" gutterBottom>
            Current Bitcoin Price (BTC/USD)
          </Typography>

          {loading && (
            <Box className="loadingContainer">
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" className="errorAlert">
              {error}
            </Alert>
          )}

          {formattedPrice && !loading && (
            <Typography variant="h2" color="primary" className="priceDisplay">
              {formattedPrice}
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handlePlaceGuess}
            disabled={loading || !!error}
          >
            Place Guess
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Game;
