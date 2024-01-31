import type { ClientToServerEvents, ServerToClientEvents } from '$types';
import { Socket, io } from 'socket.io-client';


export const socket = io() as Socket<ServerToClientEvents, ClientToServerEvents>;
