import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import * as _ from "lodash";
import {injectable, inject} from "inversify";
import IEndpointConfig from "../configs/IEndpointConfig";
import {PushNotification, IPushNotifier, IEventEmitter} from "./IPushComponents";

@injectable()
class PushNotifier implements IPushNotifier {

    private config: IEndpointConfig;

    constructor(@inject("IEventEmitter") private eventEmitter: IEventEmitter,
                @inject("IEndpointConfig") config: IEndpointConfig) {
        this.config = <IEndpointConfig>_.assign({}, config, config ? config.notifications : {});
    }

    notify(context: PushContext, clientId?: string, splitKey?: string): void {
        if (clientId) {
            this.emitToSingleClient(clientId, context, splitKey);
        } else {
            this.eventEmitter.broadcastTo(
                ContextOperations.getRoom(context, splitKey),
                ContextOperations.getChannel(context),
                this.buildNotification(context, splitKey)
            );
        }
    }

    private buildNotification(context: PushContext, splitKey: string): PushNotification {
        let url = `${this.config.protocol}://${this.config.host}`;
        if (this.config.port)
            url += `:${this.config.port}`;
        if (this.config.path)
            url += this.config.path;
        else
            url += "/projections";
        url += `/${context.area}/${context.projectionName}`.toLowerCase();
        if (splitKey)
            url += `/${splitKey}`;
        return {
            url: url
        };
    }

    private emitToSingleClient(clientId: string, context: PushContext, splitKey: string = ""): void {
        let notification = this.buildNotification(context, splitKey);
        this.eventEmitter.emitTo(clientId, ContextOperations.getChannel(context), notification);
    }
}

export default PushNotifier