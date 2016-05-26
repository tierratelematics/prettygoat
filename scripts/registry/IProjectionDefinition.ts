import {IProjection} from "../projections/IProjection";

interface IProjectionDefinition<T> {
    define():IProjection<T>
}

export default IProjectionDefinition