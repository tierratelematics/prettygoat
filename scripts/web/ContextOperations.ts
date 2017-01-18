import PushContext from "./PushContext";

class ContextOperations {
    static getChannel(context:PushContext):string {
        return `${context.area}:${context.viewmodelId}`;
    }

    static getEndpoint(context:PushContext, isSplit:boolean = false):string {
        let endpoint = `/${context.area}/${context.viewmodelId}`.toLowerCase();
        if (isSplit) endpoint += '/:key';
        return endpoint
    }
}

export default ContextOperations