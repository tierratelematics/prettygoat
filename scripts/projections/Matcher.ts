import Dictionary from "../common/Dictionary";
import {ValueOrPromise} from "../common/TypesUtil";
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

export interface WhenBlock<T extends Object> {
    $init?: () => T;
    [name: string]: (s: T, payload: Object, event?: Event) => ValueOrPromise<T>;
}
