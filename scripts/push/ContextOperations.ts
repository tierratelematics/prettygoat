import PushContext from "./PushContext";
import Constants from "../registry/Constants";

class ContextOperations {
    static getChannel(context:PushContext):string {
        return `${context.area}:${context.viewmodelId}`;
    }

    static getEndpoint(context:PushContext):string {
        return `/${context.area}/${context.viewmodelId}`.toLowerCase();
    }
}

export default ContextOperations