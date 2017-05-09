import {IFilterContext, FilterResult} from "./FilterComponents";
import {ValueOrPromise} from "../util/TypesUtil";

export interface IFilterStrategy<TState> {
    filter<TResult>(state: TState, context: IFilterContext): ValueOrPromise<FilterResult<TResult>>;
}
