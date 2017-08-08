import PushContext from "./PushContext";

export interface IPushNotifier {
    notifyAll(context: PushContext, notificationKey?: string, timestamp?: Date);
    notifyClient(context: PushContext, clientId: string, notificationKey?: string);
}

export interface ISocketClient {
    join(room: string);
    leave(room: string);
}

export interface ISocketFactory {
    socketForPath(path?: string): SocketIO.Server;
}

export interface PushNotification {
    url: string;
    notificationKey: string;
    timestamp: Date;
}

export interface IClientRegistry {
    add(client: ISocketClient, context: PushContext): string;
    remove(client: ISocketClient, context: PushContext);
}

export interface IEventEmitter {
    broadcastTo(room: string, event: string, data: any);
    emitTo(clientId: string, event: string, data: any);
}
