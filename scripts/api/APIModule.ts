import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../bootstrap/IServiceLocator";
import {Controller, TYPE} from 'inversify-express-utils';
import SizeProjectionDefinition from "./SizeProjectionDefinition";
import SnapshotManagerController from "./SnapshotManagerController";
import ProjectionsManagerController from "./ProjectionsManagerController";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import AuthorizationStrategy from "./AuthorizationStrategy";

class APIModule implements IModule {

    modules = (kernel: interfaces.Kernel) => {
        kernel.bind<IAuthorizationStrategy>("IAuthorizationStrategy").to(AuthorizationStrategy).inSingletonScope();
        kernel.bind<Controller>(TYPE.Controller).to(ProjectionsManagerController).whenTargetNamed('ProjectionsManagerController');
        kernel.bind<Controller>(TYPE.Controller).to(SnapshotManagerController).whenTargetNamed('SnapshotManagerController');
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
    }
}

export default APIModule;
