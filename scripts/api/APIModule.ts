import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../ioc/IServiceLocator";
import SizeProjectionDefinition from "./SizeProjectionDefinition";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import AuthorizationStrategy from "./AuthorizationStrategy";
import {ISubject, Subject} from "rx";
import {app} from "../web/ExpressApp";
import {NextFunction, Request, Response} from "express";
import {IMiddleware, IRequestHandler} from "../web/IRequestComponents";
import AuthMiddleware from "./AuthMiddleware";
import {ProjectionStopHandler} from "./ProjectionsManagerController";
import {ProjectionResumeHandler} from "./ProjectionsManagerController";
import {ProjectionPauseHandler} from "./ProjectionsManagerController";
import {SnapshotSaveHandler} from "./SnapshotManagerController";
import {SnapshotDeleteHandler} from "./SnapshotManagerController";
import AuthorizationHandler from "./AuthorizationController";

class APIModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IAuthorizationStrategy>("IAuthorizationStrategy").to(AuthorizationStrategy).inSingletonScope();
        container.bind<IMiddleware>("IMiddleware").to(AuthMiddleware).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(ProjectionStopHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(ProjectionResumeHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(ProjectionPauseHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(SnapshotSaveHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(SnapshotDeleteHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(AuthorizationHandler).inSingletonScope();
        container.bind<ISubject<void>>("ProjectionStatuses").toConstantValue(new Subject<void>());
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
    }
}

export default APIModule;
