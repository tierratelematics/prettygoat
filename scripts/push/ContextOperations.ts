import PushContext from "./PushContext";
import Constants from "../registry/Constants";

class ContextOperations {
    static getChannel(context:PushContext):string {
        return `${context.area}:${context.viewmodelId}`;
    }

    static getEndpoint(context:PushContext, isSplit:boolean = false):string {
        if (context.area === Constants.MASTER_AREA || context.area === Constants.INDEX_AREA)
            return `/${context.area}`.toLowerCase();
        let endpoint = `/${context.area}/${context.viewmodelId}`.toLowerCase();
        if (isSplit) endpoint += '/:key';
        return endpoint
    }
}

export default ContextOperations