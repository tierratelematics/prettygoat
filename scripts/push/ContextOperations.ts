import PushContext from "./PushContext";
import Constants from "../Constants";

class ContextOperations {
    static getChannel(context:PushContext):string {
        return `${context.area}:${context.projectionName}`;
    }

    static getEndpoint(context:PushContext):string {
        if (context.area === Constants.MASTER_AREA || context.area === Constants.INDEX_AREA)
            return `/${context.area}`.toLowerCase();
        return `/${context.area}/${context.projectionName}`.toLowerCase();
    }
}

export default ContextOperations