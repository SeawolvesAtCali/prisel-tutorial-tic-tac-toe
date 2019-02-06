import React, { Component } from 'react';
import {
  ClientContainer,
  Client,
  RoomManager,
  GameStartButton,
} from '@prisel/react';

class App extends Component {
  constructor(props) {
    super(props);
    if (!this.client) {
      this.client = new Client('ws://localhost:4040');
    }
  }

  render() {
    return (
      <div className="App">
        <ClientContainer username="player1" client={this.client}>
          <RoomManager gameTypes={['tic-tac-toe']} />
          <GameStartButton />
        </ClientContainer>
      </div>
    );
  }
}

export default App;
