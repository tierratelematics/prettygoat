import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {IClientRegistry, ISocketClient} from "./IPushComponents";
import {isEmpty} from "lodash";

@injectable()
class ClientRegistry implements IClientRegistry {

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {
    }

    add(client: ISocketClient, context: PushContext) {
        if (!this.parametersDefined(context.parameters)) {
            client.join(ContextOperations.getRoom(context));
        } else {
            let entry = this.registry.getEntry(context.projectionName, context.area);
            client.join(ContextOperations.getRoom(context, entry.data.parametersKey(context.parameters)));
        }
    }

    private parametersDefined(parameters:any):boolean {
        return parameters && !isEmpty(parameters);
    }

    remove(client: ISocketClient, context: PushContext) {
        if (!this.parametersDefined(context.parameters)) {
            client.leave(ContextOperations.getRoom(context));
        } else {
            let entry = this.registry.getEntry(context.projectionName, context.area);
            client.leave(ContextOperations.getRoom(context, entry.data.parametersKey(context.parameters)));
        }
    }
}

export default ClientRegistry