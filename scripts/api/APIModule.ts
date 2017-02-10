import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../ioc/IServiceLocator";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {IMiddleware, IRequestHandler} from "../web/IRequestComponents";
import AuthMiddleware from "./AuthMiddleware";
import {SnapshotSaveHandler, SnapshotDeleteHandler} from "./SnapshotHandlers";
import AuthorizationHandler from "./AuthorizationHandler";
import SystemProjection from "./SystemProjection";
import ApiKeyAuthorizationStrategy from "./ApiKeyAuthorizationStrategy";
import {ProjectionStopHandler, ProjectionStatsHandler} from "./ProjectionsHandlers";

class APIModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IAuthorizationStrategy>("IAuthorizationStrategy").to(ApiKeyAuthorizationStrategy).inSingletonScope();
        container.bind<IMiddleware>("IMiddleware").to(AuthMiddleware).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(ProjectionStopHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(SnapshotSaveHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(SnapshotDeleteHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(AuthorizationHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(ProjectionStatsHandler).inSingletonScope();
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SystemProjection).forArea("__diagnostic");
    }
}

export default APIModule;
