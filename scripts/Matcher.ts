import { IMatcher } from "./interfaces/IMatcher";
import { SpecialNames } from "./SpecialNames";
import * as _ from "lodash";

const wildcard = require("wildcard2");

export type EventMatch = (state: any, event: any) => any;
export type InitMatch = () => any;

const emptyState = () => { return {}; };

export class Matcher implements IMatcher {
    constructor(private definition: any) { }

    match(name: string): Function {
        this.guardAmbiguousDefinition();

        if (name === SpecialNames.Any || name === SpecialNames.Default)
            return this.explicitMatch(name, true);

        if (name === SpecialNames.Init)
            return this.explicitMatch(name) || emptyState;

        let found = this.explicitMatch(name)
            || this.wildcardMatch(name)
            || this.explicitMatch(SpecialNames.Any)
            || this.explicitMatch(SpecialNames.Default)
            || this.explicitMatch(SpecialNames.Init);

        if (found !== undefined)
            return found;

        throw new Error(`Matcher cannot find a match for ${name}`);
    }

    private guardAmbiguousDefinition() {
        const _definition = _(this.definition);

        if (_definition.has(SpecialNames.Any) && _definition.has(SpecialNames.Default))
            throw new Error(`Matcher has an ambiguous default match defined both as ${SpecialNames.Any} and ${SpecialNames.Default}`);
    }

    private explicitMatch(name: string, throwOnNotFound?: boolean): Function {
        if (_(this.definition).has(name) && _.isFunction(this.definition[name]))
            return this.definition[name];
        if (throwOnNotFound)
            throw new Error(`Matcher doesn't have a ${name} member`);
        return undefined;
    }

    private wildcardMatch(name: string): Function {
        const found = _(this.definition).toPairs().filter((pair: [string, Function]) => wildcard(name, pair[0])).first();
        if (found !== undefined && _.isFunction(found[1]))
            return <Function>found[1];
        return undefined;
    }
}
