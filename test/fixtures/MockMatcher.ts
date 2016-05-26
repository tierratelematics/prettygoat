import { IMatcher } from "../../scripts/matcher/IMatcher";

export class MockMatcher implements IMatcher {
    match(name: string): Function {
        return function(): any { return undefined; };
    }
}
