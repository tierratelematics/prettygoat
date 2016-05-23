import IPushClientRegistry from "./IPushClientRegistry";
import PushContext from "./PushContext";
import ClientEntry from "./ClientEntry";
import Dictionary from "../Dictionary";
import * as _ from "lodash";

class PushClientRegistry implements IPushClientRegistry {

    private registry:Dictionary<ClientEntry[]> = {};

    add(clientId:string, context:PushContext):void {
        if (!clientId)
            throw new Error("Client id is invalid");
        let key = this.getKeyFromContext(context);
        if (!this.registry[key])
            this.registry[key] = [];
        this.registry[key].push(new ClientEntry(clientId, context.parameters));
    }

    clientsFor(context:PushContext):ClientEntry[] {
        return this.registry[this.getKeyFromContext(context)];
    }

    remove(clientId:string, context:PushContext):void {
        let key = this.getKeyFromContext(context);
        _.remove<ClientEntry>(this.registry[key], entry => entry.id === clientId);
    }

    private getKeyFromContext(context:PushContext):string {
        return `${context.area}:${context.viewmodelId}`;
    }
}

export default PushClientRegistry