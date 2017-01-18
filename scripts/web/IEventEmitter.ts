interface IEventEmitter {
    emitTo(clientId:string, event:string, parameters:any):void;
}

export default IEventEmitter