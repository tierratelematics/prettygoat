import IFilterContext from "./IFilterContext";
import FilterOutputType from "./FilterOutputType";

interface IFilterStrategy<T extends Object> {
    filter(state: T, context: IFilterContext): {filteredState: T, type: FilterOutputType};
}

export default IFilterStrategy