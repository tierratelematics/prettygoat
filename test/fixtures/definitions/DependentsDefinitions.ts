import IProjectionDefinition from "../../../scripts/registry/IProjectionDefinition";
import {IProjection} from "../../../scripts/projections/IProjection";

export class MainProjection implements IProjectionDefinition<any> {

    define(): IProjection<any> {
        return {
            name: "main",
            definition: {}
        }
    }

}

export class Dependent1 implements IProjectionDefinition<any> {

    define(): IProjection<any> {
        return {
            name: "dependent1",
            definition: {
                "main": (s, e) => e
            }
        }
    }

}

export class Dependent2 implements IProjectionDefinition<any> {

    define(): IProjection<any> {
        return {
            name: "dependent2",
            definition: {
                "main": (s, e) => e,
                "dependent1": (s, e) => e
            }
        }
    }

}

export class Dependent3 implements IProjectionDefinition<any> {

    define(): IProjection<any> {
        return {
            name: "dependent3",
            definition: {
                "$any": (s, e) => e
            }
        }
    }

}

export class Dependent4 implements IProjectionDefinition<any> {

    define(): IProjection<any> {
        return {
            name: "dependent4",
            definition: {
                "ma*": (s, e) => e
            }
        }
    }

}


