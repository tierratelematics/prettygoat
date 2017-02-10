import PushContext from "./PushContext";
import {isUndefined} from "lodash";

class ContextOperations {
    //Determinate the event name to communicate with the frontend
    static getChannel(context:PushContext):string {
        return `${context.area}:${context.projectionName}`;
    }

    //Group connected clients in notifications groups so I can broadcast to a room when a projection (split or not) changes
    static getRoom(context: PushContext, splitKey?: string): string {
        let channel = `/${context.area}/${context.projectionName}`.toLowerCase();
        if (!isUndefined(splitKey) && splitKey !== null)
            channel += `/${splitKey}`;
        return channel;
    }
}

export default ContextOperations