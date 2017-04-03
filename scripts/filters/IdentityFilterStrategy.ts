import IFilterStrategy from "./IFilterStrategy";
import IFilterContext from "./IFilterContext";
import FilterOutputType from "./FilterOutputType";
import FilterResult from "./FilterResult";

class IdentityFilterStrategy<T> implements IFilterStrategy<T> {

    filter(state: T, context: IFilterContext): FilterResult<T>|Promise<FilterResult<T>> {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        };
    }

}

export default IdentityFilterStrategy