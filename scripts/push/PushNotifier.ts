import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import {PushNotification, IPushNotifier, IEventEmitter} from "./PushComponents";
import {IEndpointConfig} from "../configs/EndpointConfig";
import {INotificationConfig} from "../configs/NotificationConfig";

@injectable()
class PushNotifier implements IPushNotifier {

    private config: INotificationConfig;

    constructor(@inject("IEventEmitter") private eventEmitter: IEventEmitter,
                @inject("IEndpointConfig") endpointConfig: IEndpointConfig,
                @inject("INotificationConfig") notificationConfig: INotificationConfig) {
        this.config = {...endpointConfig, ...notificationConfig};
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

    private emitToSingleClient(clientId: string, context: PushContext, notificationKey: string): void {
        let notification = this.buildNotification(context, notificationKey);
        this.eventEmitter.emitTo(clientId, ContextOperations.getChannel(context), notification);
    }

    private buildNotification(context: PushContext, notificationKey: string = null): PushNotification {
        return {
            url: `${this.config.protocol}://${this.config.host}${this.config.port ? ":"
                + this.config.port : ""}/projections/${context.area}/${context.projectionName}`.toLowerCase(),
            notificationKey: notificationKey
        };
    }
}

export default PushNotifier
