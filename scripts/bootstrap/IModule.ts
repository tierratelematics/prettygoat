import {interfaces} from "inversify";
import IServiceLocator from "./IServiceLocator";
import {IProjectionRegistry} from "./ProjectionRegistry";

interface IModule {
    modules?: (container: interfaces.Container) => void;
    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export default IModule;
