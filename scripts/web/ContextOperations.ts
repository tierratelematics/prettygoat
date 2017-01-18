import PushContext from "./PushContext";
import {isUndefined} from "lodash";

class ContextOperations {
    static getChannel(context: PushContext, splitKey?: string): string {
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