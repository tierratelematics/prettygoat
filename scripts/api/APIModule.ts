import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../bootstrap/IServiceLocator";
import {Controller, TYPE} from 'inversify-express-utils';
import ProjectionsManagerController from "./ProjectionManagerController";
import SizeProjectionDefinition from "./SizeProjectionDefinition";

class APIModule implements IModule {

    modules = (kernel: interfaces.Kernel) => {
        kernel.bind<Controller>(TYPE.Controller).to(ProjectionsManagerController).inSingletonScope();
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
    }
}

export default APIModule;
