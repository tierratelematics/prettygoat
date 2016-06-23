import IProjectionRunner from "./IProjectionRunner";
import {IProjection, IWhen} from "./IProjection";

interface IProjectionRunnerFactory {
    create<T>(projectionName:string, definition:IWhen<T>):IProjectionRunner<T>;
}

export default IProjectionRunnerFactory