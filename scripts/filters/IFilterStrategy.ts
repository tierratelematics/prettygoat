import Partial from "../util/Partial";
import {IFilterContext, FilterResult} from "./FilterComponents";

export interface IFilterStrategy<TState, TResult> {
    filter(state: TState, context: IFilterContext): FilterResult<TResult>|Promise<FilterResult<TResult>>;
}

export interface IPartialFilterStrategy<T> extends IFilterStrategy<T, Partial<T>> {

}