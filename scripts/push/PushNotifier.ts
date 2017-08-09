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

    notifyAll(context: PushContext, notificationKey?: string, timestamp?: Date) {
        this.eventEmitter.broadcastTo(
            ContextOperations.keyFor(context, notificationKey),
            this.buildNotification(context, notificationKey, timestamp)
        );
    }

    notifyClient(context: PushContext, clientId: string, notificationKey?: string) {
        this.emitToSingleClient(clientId, context, notificationKey);
    }

    private emitToSingleClient(clientId: string, context: PushContext, notificationKey: string): void {
        let notification = this.buildNotification(context, notificationKey);
        this.eventEmitter.emitTo(clientId, ContextOperations.keyFor(context, notificationKey), notification);
    }

    private buildNotification(context: PushContext, notificationKey: string = null, timestamp: Date = null): PushNotification {
        return {
            url: `${this.config.protocol}://${this.config.host}${this.config.port ? ":"
                + this.config.port : ""}/projections/${context.area}/${context.projectionName}`.toLowerCase(),
            notificationKey: notificationKey,
            timestamp: timestamp
        };
    }
}

export default PushNotifier
