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
import { useAuth } from "../hooks/useAuth";
import { useAuthModal } from "../hooks/useAuthModal";
import logo from "../assets/logo.png";
import "./Game.css";

const Game = () => {
  const { price, loading, error } = useBitcoinPrice();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const handlePlaceGuess = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    // TODO: Implement guess placement logic
    console.log("Place guess clicked");
  };

  return (
    <Container maxWidth="md">
      <Box className="homePageContainer">
        <img src={logo} alt="BitWin Logo" className="bitwinLogo" />

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

          {price && !loading && (
            <Typography variant="h2" color="primary" className="priceDisplay">
              {price}
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
