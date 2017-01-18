import PushContext from "./PushContext";
import {isUndefined} from "lodash";

class ContextOperations {
    //Determinate the event name to communicate with the frontend
    static getChannel(context:PushContext):string {
        return `${context.area}:${context.viewmodelId}`;
    }

    //Group connected clients in notifications groups so I can broadcast to a room when a projection (split or not) changes
    static getRoom(context: PushContext, splitKey?: string): string {
        let channel = `/${context.area}/${context.viewmodelId}`.toLowerCase();
        if (!isUndefined(splitKey))
            channel += `/${splitKey}`;
        return channel;
    }

    static getEndpoint(context: PushContext, isSplit: boolean = false): string {
        let endpoint = `/${context.area}/${context.viewmodelId}`.toLowerCase();
        if (isSplit) endpoint += '/:key';
        return endpoint
    }
}

export default ContextOperations