import IFilterStrategy from "./IFilterStrategy";
import IFilterContext from "./IFilterContext";
import FilterOutputType from "./FilterOutputType";

class IdentityFilterStrategy<T> implements IFilterStrategy<T> {

    filter(state: T, context: IFilterContext): {filteredState: T; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        };
    }

}

export default IdentityFilterStrategy