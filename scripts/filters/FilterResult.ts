import FilterOutputType from "./FilterOutputType";

type FilterResult<T> = {filteredState: T, type: FilterOutputType};

export default FilterResult