interface IFilterContext {
    headers: { [key: string]: string };
    params: { [key: string]: string };
}

export default IFilterContext