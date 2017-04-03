import {IFilterStrategy} from "./IFilterStrategy";
import {IFilterContext, FilterResult, FilterOutputType} from "./FilterComponents";

class IdentityFilterStrategy<T> implements IFilterStrategy<T> {

    filter<T>(state: T, context: IFilterContext): FilterResult<T>|Promise<FilterResult<T>> {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        };
    }

}

export default IdentityFilterStrategy