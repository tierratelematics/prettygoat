import IFilterStrategy from "./IFilterStrategy";
import IFilterContext from "./IFilterContext";
import FilterOutputType from "./FilterOutputType";
import IFilterResult from "./IFilterResult";

class IdentityFilterStrategy<T> implements IFilterStrategy<T> {

    filter(state: T, context: IFilterContext): IFilterResult<T>|Promise<IFilterResult<T>> {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        };
    }

}

export default IdentityFilterStrategy