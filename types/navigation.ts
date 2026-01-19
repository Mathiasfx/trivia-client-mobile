import type { Player, Room } from './game';

export type RootStackParamList = {
  Login: undefined;
  Lobby: {
    playerName: string;
    roomId: string;
    playerId: string;
    room: any;
  };
  Game: { 
    playerName: string; 
    playerId: string; 
    room: Room; 
    finalRanking?: Player[]; 
    gameEnded?: boolean;
  };
};
