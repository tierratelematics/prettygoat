import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../bootstrap/IServiceLocator";
import {interfaces as expressInterfaces, TYPE} from 'inversify-express-utils';
import SizeProjectionDefinition from "./SizeProjectionDefinition";
import SnapshotManagerController from "./SnapshotManagerController";
import ProjectionsManagerController from "./ProjectionsManagerController";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import ApiKeyAuthorizationStrategy from "./ApiKeyAuthorizationStrategy";
import AuthorizationController from "./AuthorizationController";
import {ISubject,Subject} from "rx";

class APIModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IAuthorizationStrategy>("IAuthorizationStrategy").to(ApiKeyAuthorizationStrategy).inSingletonScope();
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(ProjectionsManagerController).whenTargetNamed('ProjectionsManagerController');
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(SnapshotManagerController).whenTargetNamed('SnapshotManagerController');
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(AuthorizationController).whenTargetNamed('AuthorizationController');
        container.bind<ISubject<void>>("ProjectionStatuses").toConstantValue(new Subject<void>());
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
    }
}

export default APIModule;
