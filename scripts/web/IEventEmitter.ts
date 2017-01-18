interface IEventEmitter {
    broadcastTo(room: string, event:string, data:any);
    emitTo(clientId: string, event: string, data: any);
}

export default IEventEmitter