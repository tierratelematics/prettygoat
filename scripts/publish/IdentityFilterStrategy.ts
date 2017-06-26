import {IFilterStrategy} from "./IFilterStrategy";
import {IFilterContext, FilterResult, FilterOutputType} from "./FilterComponents";
import {ValueOrPromise} from "../util/TypesUtil";

class IdentityFilterStrategy<T> implements IFilterStrategy<T, T> {

    filter(state: T, context: IFilterContext): ValueOrPromise<FilterResult<T>> {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        };
    }
}

export default IdentityFilterStrategy
