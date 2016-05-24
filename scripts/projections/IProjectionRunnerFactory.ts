import IProjectionDefinition from "../registry/IProjectionDefinition";
import IProjectionRunner from "./IProjectionRunner";

interface IProjectionRunnerFactory {
    create<T>(definition:IProjectionDefinition<T>):IProjectionRunner<T>
}

export default IProjectionRunnerFactory