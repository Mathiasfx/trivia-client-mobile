import { io, Socket } from 'socket.io-client';
import type { Player, Room } from '../types/game';

let expoConfig: any = {};

try {
  const Constants = require('expo-constants').default;
  expoConfig = Constants.expoConfig?.extra || {};
} catch (error) {
  console.warn('expo-constants no disponible, usando valores por defecto');
}

class SocketService {
  private socket: Socket | null = null;
  private room: Room | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private socketUrl: string;
  private reconnectionAttempts: number;
  private apiTimeout: number;

  constructor() {
    this.socketUrl = expoConfig.socketUrl || 'http://localhost:3007/rooms';
    this.reconnectionAttempts = expoConfig.maxReconnectionAttempts || 10;
    this.apiTimeout = expoConfig.apiTimeout || 5000;
  }

  connect() {
    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = io(this.socketUrl, {
        withCredentials: true,
        transports: [ 'polling','websocket'], 
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.reconnectionAttempts,
        timeout: this.apiTimeout,
        forceNew: false,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.emit('connect');
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.emit('disconnect');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Error de conexión:', error);
        this.emit('connect_error', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Falló la reconexión después de múltiples intentos');
        reject(new Error('No se pudo conectar al servidor después de múltiples intentos'));
      });

      this.setupEventListeners();
    });
  }

  private async waitForConnection(): Promise<void> {
    if (this.isConnected) {
      return;
    }
    if (this.connectionPromise) {
      await this.connectionPromise;
    } else {
      throw new Error('Socket no inicializado');
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('roomState', (roomState: Room) => {
      this.room = roomState;
      this.emit('roomStateUpdate', roomState);
    });

    this.socket.on('playerJoined', ({ player }: { player: Player }) => {
      this.emit('playerJoined', player);
    });

    this.socket.on('playerLeft', ({ player }: { player: Player }) => {
      this.emit('playerLeft', player);
    });

    this.socket.on('countdown', () => {
      this.emit('countdown');
    });

    this.socket.on('newRound', (data) => {
      this.emit('newRound', data);
    });

    this.socket.on('gameStarted', (data) => {
      this.emit('gameStarted', data);
    });

    this.socket.on('gameEnded', (data) => {
      this.emit('gameEnded', data);
    });

    this.socket.on('gameEnding', (data) => {
      this.emit('gameEnding', data);
    });

    this.socket.on('answerSubmitted', (data) => {
      this.emit('answerSubmitted', data);
    });

    this.socket.on('rankingUpdated', (ranking) => {
      this.emit('rankingUpdated', ranking);
    });

    this.socket.on('error', (error) => {
      console.error('Error del servidor:', error);
      this.emit('error', error);
    });
  }

  async joinRoom(roomId: string, playerName: string) {
    try {
      await this.waitForConnection();
      this.socket!.emit('joinRoom', { roomId, name: playerName });
    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      throw error;
    }
  }

  async submitAnswer(roomId: string, playerId: string, answer: string) {
    await this.waitForConnection();
    this.socket!.emit('submitAnswer', { roomId, playerId, answer });
  }

  async startGame(roomId: string, triviaId: string) {
    await this.waitForConnection();
    this.socket!.emit('startGame', { roomId, triviaId });
  }

  async createRoom(roomId: string, triviaId: string) {
    await this.waitForConnection();
    this.socket!.emit('createRoom', { roomId, triviaId });
  }

  async getRoomState(roomId: string) {
    await this.waitForConnection();
    this.socket!.emit('getRoomState', { roomId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  get currentRoom() {
    return this.room;
  }

  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

export const socketService = new SocketService();