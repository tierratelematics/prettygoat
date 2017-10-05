import PushContext from "./PushContext";
import {Event} from "../events/Event";

export interface IPushNotifier {
    notifyAll(context: PushContext, event: Event, notificationKey?: string);
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
    eventId: string;
}

export interface IClientRegistry {
    add(client: ISocketClient, context: PushContext): string;
    remove(client: ISocketClient, context: PushContext): string;
}

export interface IEventEmitter {
    broadcastTo(room: string, data: any);
    emitTo(clientId: string, room: string, data: any);
}
