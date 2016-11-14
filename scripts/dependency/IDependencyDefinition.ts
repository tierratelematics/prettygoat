import Dictionary from "../Dictionary";

interface IDependencyDefinition{
    dependency: Dictionary<any>
    getDependecyList(): void;
    isProjection(string,string):boolean
}

export default IDependencyDefinition