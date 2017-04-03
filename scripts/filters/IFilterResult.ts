import FilterOutputType from "./FilterOutputType";

type IFilterResult<T> = {filteredState: T, type: FilterOutputType};

export default IFilterResult