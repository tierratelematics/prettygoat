import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../bootstrap/IServiceLocator";
import {interfaces as expressInterfaces, TYPE} from 'inversify-express-utils';
import SizeProjectionDefinition from "./SizeProjectionDefinition";
import SnapshotManagerController from "./SnapshotManagerController";
import ProjectionsManagerController from "./ProjectionsManagerController";

class APIModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(ProjectionsManagerController).whenTargetNamed('ProjectionsManagerController');
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(SnapshotManagerController).whenTargetNamed('SnapshotManagerController');
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
    }
}

export default APIModule;
