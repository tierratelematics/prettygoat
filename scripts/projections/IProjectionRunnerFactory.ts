import {IProjectionRunner} from "./IProjectionRunner";
import {IProjection} from "./IProjection";

interface IProjectionRunnerFactory {
    create<T>(projection: IProjection<T>): IProjectionRunner<T>;
}

export default IProjectionRunnerFactory
