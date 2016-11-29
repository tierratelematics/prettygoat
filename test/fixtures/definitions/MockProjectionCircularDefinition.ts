import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";
import Projection from "../../../scripts/registry/ProjectionDecorator";

@Projection("CircularA")
export class MockProjectionCircularADefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "CircularA",
            definition: {
                "CircularB": (s, e:number) => s + e,
                "test": (s, e:number) => s + e
            }
        };
    }

}

@Projection("CircularB")
export class MockProjectionCircularBDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "CircularB",
            definition: {
                "CircularA": (s, e:number) => s + e
            }
        };
    }
}

@Projection("CircularAny")
export class MockProjectionCircularAnyDefinition implements IProjectionDefinition<number> {

    define():IProjection<number> {
        return {
            name: "CircularAny",
            definition: {
                $any: (s, e:number) => s + e
            }
        };
    }

}
