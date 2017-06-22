import Dictionary from "../util/Dictionary";

export interface IMatcher {
    match(name: string): Function;
}

export class Matcher implements IMatcher {

    constructor(private definition: Dictionary<any>) {
    }

    match(name: string): Function {
        return this.definition[name] || this.definition["$default"];
    }
}
