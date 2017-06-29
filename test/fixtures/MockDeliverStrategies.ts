import {DeliverAuthorization, DeliverContext, DeliverResult, IDeliverStrategy} from "../../scripts/projections/Deliver";

export class ContentDeliverStrategy implements IDeliverStrategy<any> {

    deliver(state: any, context: DeliverContext): DeliverResult<any> {
        return [state, DeliverAuthorization.CONTENT];
    }

}

export class AsyncContentDeliverStrategy implements IDeliverStrategy<any> {

    deliver(state: any, context: DeliverContext): Promise<DeliverResult<any>> {
        return Promise.resolve([state, DeliverAuthorization.CONTENT]);
    }

}

export class ForbiddenDeliverStrategy implements IDeliverStrategy<any> {

    deliver(state: any, context: DeliverContext): DeliverResult<any> {
        return [state, DeliverAuthorization.FORBIDDEN];
    }

}

export class UnauthorizedDeliverStrategy implements IDeliverStrategy<any> {

    deliver(state: any, context: DeliverContext): DeliverResult<any> {
        return [state, DeliverAuthorization.UNAUTHORIZED];
    }

}

export class NotificationDeliverStrategy implements IDeliverStrategy<any> {

    deliver(state: any, context: DeliverContext): DeliverResult<any> {
        return [context.partitionKey, DeliverAuthorization.UNAUTHORIZED];
    }

}