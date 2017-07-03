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

    notify(context: PushContext, notificationKey?: string, clientId?: string): void {
        if (clientId) {
            this.emitToSingleClient(clientId, context, notificationKey);
        } else {
            this.eventEmitter.broadcastTo(
                ContextOperations.getRoom(context, notificationKey),
                ContextOperations.getChannel(context),
                this.buildNotification(context, notificationKey)
            );
        }
    }

    private emitToSingleClient(clientId: string, context: PushContext, notificationKey = ""): void {
        let notification = this.buildNotification(context, notificationKey);
        this.eventEmitter.emitTo(clientId, ContextOperations.getChannel(context), notification);
    }

    private buildNotification(context: PushContext, notificationKey: string): PushNotification {
        let url = `${this.config.protocol}://${this.config.host}`;
        if (this.config.port)
            url += `:${this.config.port}`;
        url += `${this.config.path}/${context.area}/${context.projectionName}`.toLowerCase();
        if (notificationKey)
            url += `/${notificationKey}`;
        return {
            url: url
        };
    }
}

export default PushNotifier
