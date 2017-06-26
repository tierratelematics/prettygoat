import Dictionary from "../util/Dictionary";
import {ValueOrPromise} from "../util/TypesUtil";
import {Event} from "../events/Event";

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

export interface IWhen<T extends Object> {
    $init?: () => T;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
}
