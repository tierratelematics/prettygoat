import IModule from "./IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "./IServiceLocator";
import SizeProjectionDefinition from "../diagnostic/SizeProjectionDefinition";
import { Controller, TYPE } from 'inversify-express-utils';
import ProjectionsManager from "../controllers/ProjectionsManager";

class APIModule implements IModule {

    modules = (kernel:interfaces.Kernel) => {
        kernel.bind<Controller>(TYPE.Controller).to(ProjectionsManager).inSingletonScope();
    };

    register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
    }
}

export default APIModule;
