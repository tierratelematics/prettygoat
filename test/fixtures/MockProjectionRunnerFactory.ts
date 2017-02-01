import IProjectionRunnerFactory from "../../scripts/projections/IProjectionRunnerFactory";
import {IProjection} from "../../scripts/projections/IProjection";
import IProjectionRunner from "../../scripts/projections/IProjectionRunner";

export default class MockProjectionRunnerFactory implements IProjectionRunnerFactory {

    create<T>(projection: IProjection<T>): IProjectionRunner<T> {
        return undefined;
    }

}