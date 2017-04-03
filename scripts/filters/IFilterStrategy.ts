import {IFilterContext, FilterResult} from "./FilterComponents";

export interface IFilterStrategy<TState> {
    filter<TResult>(state: TState, context: IFilterContext): FilterResult<TResult>|Promise<FilterResult<TResult>>;
}
