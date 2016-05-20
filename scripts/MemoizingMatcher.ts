import { IMatcher } from "./interfaces/IMatcher";
import _ = require("lodash");

export class MemoizingMatcher implements IMatcher {
    private memoizedMatch: Function;

    constructor(private baseMatcher: IMatcher) {
        this.memoizedMatch = _.memoize(this.baseMatcher.match);
    }

    match(name: string): Function {
        return this.memoizedMatch(name);
    }
}
