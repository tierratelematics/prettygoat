import {IProjection} from "../interfaces/IProjection";

interface IProjectionDefinition<T> {
    define():IProjection<T>
}

export default IProjectionDefinition