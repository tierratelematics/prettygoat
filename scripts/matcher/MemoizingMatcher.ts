import {IMatcher} from "./IMatcher";
import Dictionary from "../Dictionary";

export class MemoizingMatcher implements IMatcher {
    private cache:Dictionary<Function> = {};

    constructor(private baseMatcher:IMatcher) {
    }

    match(name:string):Function {
        let cachedMatch = this.cache[name];
        if (!cachedMatch)
            this.cache[name] = cachedMatch = this.baseMatcher.match(name);
        return cachedMatch;
    }
}

