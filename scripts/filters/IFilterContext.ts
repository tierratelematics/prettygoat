import Dictionary from "../util/Dictionary";

interface IFilterContext {
    headers: Dictionary<string>;
    params: Dictionary<string>;
}

export default IFilterContext