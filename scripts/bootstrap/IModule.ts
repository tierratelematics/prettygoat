import {interfaces} from "inversify";
import IServiceLocator from "./IServiceLocator";
import IProjectionRegistry from "../registry/IProjectionRegistry";

interface IModule {
    modules?:(kernel:interfaces.Kernel) => void;
    register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void;
}

export default IModule;
