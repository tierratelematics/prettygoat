import IClientRegistry from "./IClientRegistry";
import PushContext from "./PushContext";
import ClientEntry from "./ClientEntry";
import Dictionary from "../Dictionary";
import * as _ from "lodash";
import ContextOperations from "./ContextOperations";

class ClientRegistry implements IClientRegistry {

    private registry:Dictionary<ClientEntry[]> = {};

    add(clientId:string, context:PushContext):void {
        if (!clientId)
            throw new Error("Client id is invalid");
        let key = ContextOperations.getChannel(context);
        if (!this.registry[key])
            this.registry[key] = [];
        this.registry[key].push(new ClientEntry(clientId, context.parameters));
    }

    clientsFor(context:PushContext):ClientEntry[] {
        return this.registry[ContextOperations.getChannel(context)];
    }

    remove(clientId:string, context:PushContext):void {
        _.remove<ClientEntry>(this.registry[ContextOperations.getChannel(context)], entry => entry.id === clientId);
    }
}

export default ClientRegistry