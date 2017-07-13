import Dictionary from "../common/Dictionary";
import {ValueOrPromise} from "../common/TypesUtil";

export enum DeliverAuthorization {
    CONTENT,
    UNAUTHORIZED,
    FORBIDDEN
}

export type DeliverResult<T> = [T, DeliverAuthorization];

export interface DeliverContext {
    headers: Dictionary<string>;
    params: Dictionary<string>;
}

export interface IDeliverStrategy<TState, TResult = any> {
    deliver(state: TState, context: DeliverContext, readModels?: Dictionary<any>): ValueOrPromise<DeliverResult<TResult>>;
}

export class IdentityDeliverStrategy<T> implements IDeliverStrategy<T, T> {

    deliver(state: T, context: DeliverContext): ValueOrPromise<DeliverResult<T>> {
        return [state, DeliverAuthorization.CONTENT];
    }
}
