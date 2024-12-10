type WebSocketClient = {
    id: string;  // userId
    ws: WebSocket;
};

export class WebSocketManager {
    private clients: Map<string, WebSocket> = new Map();

    addClient(userId: string, ws: WebSocket) {
        this.clients.set(userId, ws);
    }

    removeClient(userId: string) {
        this.clients.delete(userId);
    }

    // Send to specific user
    sendToUser(userId: string, message: any) {
        const client = this.clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    // Broadcast to multiple users
    broadcast(userIds: string[], message: any) {
        userIds.forEach(userId => {
            this.sendToUser(userId, message);
        });
    }
}

export const wsManager = new WebSocketManager();