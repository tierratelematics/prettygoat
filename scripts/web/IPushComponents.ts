import PushContext from "./PushContext";

export interface IPushNotifier {
    notify(context:PushContext, clientId?:string, splitKey?:string):void;
}

export interface ISocketClient {
    join(room: string);
    leave(room: string);
}

export interface ISocketFactory {
    socketForPath(path?:string):SocketIO.Server;
}

export interface PushNotification {
    url: string
}

export interface IClientRegistry {
    add(client: ISocketClient, context: PushContext);
    remove(client: ISocketClient, context: PushContext);
}

export interface IEventEmitter {
    broadcastTo(room: string, event:string, data:any);
    emitTo(clientId: string, event: string, data: any);
}