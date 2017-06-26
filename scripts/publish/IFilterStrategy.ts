import {IFilterContext, FilterResult} from "./FilterComponents";
import {ValueOrPromise} from "../util/TypesUtil";

export interface IFilterStrategy<TState, TResult = any> {
    filter(state: TState, context: IFilterContext): ValueOrPromise<FilterResult<TResult>>;
}
