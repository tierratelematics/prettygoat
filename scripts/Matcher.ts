/// <reference path="../typings/main.d.ts" />
import * as _ from "lodash";
const wildcard = require("wildcard2");

export type EventMatch = (state: any, event: any) => any;

export class Matcher<T extends Function> {
    constructor(private definition: any) { }

    match(name: string): T {
        this.guardAmbiguousDefinition();

        if (name === "$any" || name === "$default")
            return this.explicitMatch(name, true);

        let found = this.explicitMatch(name) || this.wildcardMatch(name) || this.explicitMatch("$any") || this.explicitMatch("$default");
        if (found !== undefined)
            return found;

        throw new Error(`Matcher cannot find a match for ${name}`);
    }

    private guardAmbiguousDefinition() {
        const _definition = _(this.definition);

        if (_definition.has("$any") && _definition.has("$default"))
            throw new Error(`Matcher has an ambiguous default match defined both as $any and $default`);
    }

    private explicitMatch(name: string, throwOnNotFound?: boolean): T {
        if (_(this.definition).has(name) && _.isFunction(this.definition[name]))
            return <T>this.definition[name];
        if (throwOnNotFound)
            throw new Error(`Matcher doesn't have a ${name} member`);
        return undefined;
    }

    private wildcardMatch(name: string): T {
        const found = _(this.definition).toPairs().filter((pair: [string, Function]) => wildcard(name, pair[0])).first();
        if (found !== undefined && _.isFunction(found[1]))
            return <T>found[1];
        return undefined;
    }
}
