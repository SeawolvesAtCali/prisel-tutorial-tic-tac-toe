const { Server, debug } = require('@prisel/server');

const server = new Server({ host: 'localhost', port: 4040 });
const possibleMoves = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);

server.register({
  type: 'tic-tac-toe',
  maxPlayers: 2,
  canStart: handle => {
    return handle.players.length === 2;
  },
  onStart: handle => {
    const [player1, player2] = handle.players;
    handle.setState({
      currentPlayer: player1,
      patterns: {
        [player1]: 'X',
        [player2]: 'O',
      },
      board: Array(9).fill(''),
    });
  },
  onMessage: (handle, player, data) => {
    if (player !== handle.state.currentPlayer) {
      return;
    }
    // let's design the client instruction to be { type: 'move', payload: <number> }
    const { type, payload: move } = data;
    if (type === 'move') {
      if (!possibleMoves.has(move)) {
        debug(`${move} is not a valid move`);
        return;
      }
      if (this.state.board[move] !== '') {
        debug(`${move} is already occupied`);
        return;
      }
      const newState = handle.setState(draftState => {
        draftState.board[move] = draftState.patterns[draftState.currentPlayer];
      });
      handle.broadcast(handle.players, {
        type: 'board update',
        payload: newState.board,
      });

      const winner = getWinner(handle);
      if (winner) {
        handle.setState({
          winner,
        });
        handle.endGame();
        return;
      }

      if (newState.board.every(cell => cell !== '')) {
        handle.endGame();
      }
    }
  },
  onEnd(handle) {
    const { winner } = handle.state;
    if (winner) {
      handle.players.forEach(player => {
        if (player === winner) {
          handle.emit(player, { type: 'result', payload: 'you won!' });
        } else {
          handle.emit(player, {
            type: 'result',
            payload: 'you lost.',
          });
        }
      });
    } else {
      handle.broadcast(handle.players, {
        type: 'result',
        payload: `It's a tie`,
      });
    }
  },
});

function getPlayerForPatterns(handle, pattern) {
  return handle.players.find(
    player => handle.state.patterns[player] === pattern,
  );
}
function areMovesFromSamePlayer(...moves) {
  if (!moves[0]) {
    return false;
  }
  for (let move of moves) {
    if (move !== moves[0]) {
      return false;
    }
  }
  return true;
}
function getWinner(handle) {
  const { board } = this.state;
  const possibleWinningSets = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const winningSet = possibleWinningSets
    .map(possibleSet => possibleSet.map(position => board[position]))
    .find(areMovesFromSamePlayer);
  if (winningSet) {
    return getPlayerForPatterns(winningSet[0]);
  }
}
