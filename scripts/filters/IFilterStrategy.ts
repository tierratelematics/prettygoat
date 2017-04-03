import IFilterContext from "./IFilterContext";
import FilterResult from "./FilterResult";

interface IFilterStrategy<T extends Object> {
    filter(state: T, context: IFilterContext): FilterResult<T>|Promise<FilterResult<T>>;
}

export default IFilterStrategy