import IFilterContext from "./IFilterContext";
import IFilterResult from "./IFilterResult";

interface IFilterStrategy<T extends Object> {
    filter(state: T, context: IFilterContext): IFilterResult<T>|Promise<IFilterResult<T>>;
}

export default IFilterStrategy