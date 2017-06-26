import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import IEndpointConfig from "../configs/IEndpointConfig";
import {PushNotification, IPushNotifier, IEventEmitter} from "./IPushComponents";
import INotificationConfig from "../configs/INotificationConfig";

@injectable()
class PushNotifier implements IPushNotifier {

    private config: INotificationConfig;

    constructor(@inject("IEventEmitter") private eventEmitter: IEventEmitter,
                @inject("IEndpointConfig") endpointConfig: IEndpointConfig,
                @inject("INotificationConfig") notificationConfig: INotificationConfig) {
        let defaultPath = {path: "/projections"};
        this.config = {...endpointConfig, ...defaultPath, ...notificationConfig};
    }

    notify(context: PushContext, splitKey?: string, clientId?: string): void {
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
        url += `${this.config.path}/${context.area}/${context.projectionName}`.toLowerCase();
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
