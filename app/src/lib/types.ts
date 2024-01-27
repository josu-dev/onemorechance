export type WebSocketMessage = {
    event: string;
    data: Record<string, unknown>;
}
