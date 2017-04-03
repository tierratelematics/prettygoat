import Dictionary from "../util/Dictionary";

export enum FilterOutputType {
    CONTENT,
    UNAUTHORIZED,
    FORBIDDEN
}

export type FilterResult<T> = {filteredState: T, type: FilterOutputType};

export interface IFilterContext {
    headers: Dictionary<string>;
    params: Dictionary<string>;
}