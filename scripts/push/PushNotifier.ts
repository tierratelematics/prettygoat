import PushContext from "./PushContext";
import ContextOperations from "./ContextOperations";
import {injectable, inject} from "inversify";
import {PushNotification, IPushNotifier, IEventEmitter} from "./PushComponents";
import {IEndpointConfig} from "../configs/EndpointConfig";
import {INotificationConfig} from "../configs/NotificationConfig";
import {Event, NullEvent} from "../events/Event";

@injectable()
class PushNotifier implements IPushNotifier {

    private config: INotificationConfig;

    constructor(@inject("IEventEmitter") private eventEmitter: IEventEmitter,
                @inject("IEndpointConfig") endpointConfig: IEndpointConfig,
                @inject("INotificationConfig") notificationConfig: INotificationConfig) {
        this.config = {...endpointConfig, ...notificationConfig};
    }

    notifyAll(context: PushContext, event: Event, notificationKey?: string) {
        this.eventEmitter.broadcastTo(
            ContextOperations.keyFor(context, notificationKey),
            this.buildNotification(context, event, notificationKey)
        );
    }

    notifyClient(context: PushContext, clientId: string, notificationKey?: string) {
        this.emitToSingleClient(clientId, context, notificationKey);
    }

    private emitToSingleClient(clientId: string, context: PushContext, notificationKey: string): void {
        let notification = this.buildNotification(context, null, notificationKey);
        this.eventEmitter.emitTo(clientId, ContextOperations.keyFor(context, notificationKey), notification);
    }

    private buildNotification(context: PushContext, event: Event, notificationKey: string = null): PushNotification {
        event = event || NullEvent;
        return {
            url: `${this.config.protocol}://${this.config.host}${this.config.port ? ":"
                + this.config.port : ""}/projections/${context.area}/${context.projectionName}`.toLowerCase(),
            notificationKey: notificationKey,
            timestamp: event.timestamp,
            eventId: event.id
        };
    }
}

export default PushNotifier
