import IPushNotifier from "./IPushNotifier";
import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import IEventEmitter from "./IEventEmitter";
import IClientRegistry from "./IClientRegistry";
import * as _ from "lodash";
import ClientEntry from "./ClientEntry";
import {injectable, inject} from "inversify";
import IEndpointConfig from "../configs/IEndpointConfig";
import IProjectionRegistry from "../registry/IProjectionRegistry";

@injectable()
class PushNotifier implements IPushNotifier {

    constructor(@inject("IEventEmitter") private eventEmitter:IEventEmitter,
                @inject("IClientRegistry") private clientRegistry:IClientRegistry,
                @inject("IEndpointConfig") private config:IEndpointConfig,
                @inject("IProjectionRegistry") private projectionRegistry:IProjectionRegistry) {

    }

    notify(context:PushContext, clientId?:string, splitKey?:string):void {
        let clients = this.clientRegistry.clientsFor(context),
            entry = this.projectionRegistry.getEntry(context.viewmodelId, context.area),
            parametersKey = entry.data.parametersKey,
            isSplit = entry.data.projection.split;
        if (clientId) {
            if (!_.isEmpty(context.parameters)) {
                this.emitToClient(clientId, context, parametersKey(context.parameters));
            } else {
                this.emitToClient(clientId, context);
            }
        } else {
            _.forEach<ClientEntry>(clients, client => {
                if (!isSplit || (isSplit && parametersKey(client.parameters) === splitKey))
                    this.emitToClient(client.id, context, splitKey || "");
            });
        }
    }

    private emitToClient(clientId:string, context:PushContext, splitKey:string = ""):void {
        let endpoint = ContextOperations.getEndpoint(context),
            url = `${this.config.protocol}://${this.config.host}`;
        if (this.config.port)
            url += `:${this.config.port}`;
        if (this.config.path)
            url += this.config.path;
        url += `${endpoint}/${splitKey}`;
        this.eventEmitter.emitTo(clientId, ContextOperations.getChannel(context), {url: url});
    }
}

export default PushNotifier