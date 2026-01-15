export const GET_PLAYER_QUERY = `
  query GetPlayer($userId: String!) {
    getPlayer(userId: $userId) {
      userId
      score
      activeGuess
    }
  }
`;

export const CREATE_PLAYER_MUTATION = `
  mutation CreatePlayer($userId: String!, $score: Int!) {
    createPlayer(userId: $userId, score: $score) {
      userId
      score
      activeGuess
    }
  }
`;

export const UPDATE_PLAYER_ACTIVE_GUESS_MUTATION = `
  mutation UpdatePlayer($userId: String!, $activeGuess: AWSJSON!) {
    updatePlayer(userId: $userId, activeGuess: $activeGuess) {
      userId
      score
      activeGuess
    }
  }
`;

export const UPDATE_PLAYER_SCORE_AND_GUESS_MUTATION = `
  mutation UpdatePlayer($userId: String!, $score: Int!, $activeGuess: AWSJSON!) {
    updatePlayer(userId: $userId, score: $score, activeGuess: $activeGuess) {
      userId
      score
      activeGuess
    }
  }
`;
