import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../ioc/IServiceLocator";
import {interfaces as expressInterfaces, TYPE} from 'inversify-express-utils';
import SizeProjectionDefinition from "./SizeProjectionDefinition";
import SnapshotManagerController from "./SnapshotManagerController";
import ProjectionsManagerController from "./ProjectionsManagerController";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import AuthorizationStrategy from "./AuthorizationStrategy";
import AuthorizationController from "./AuthorizationController";
import {ISubject, Subject} from "rx";
import {app} from "../web/ExpressApp";
import {NextFunction, Request, Response} from "express";

class APIModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IAuthorizationStrategy>("IAuthorizationStrategy").to(AuthorizationStrategy).inSingletonScope();
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(ProjectionsManagerController).whenTargetNamed('ProjectionsManagerController');
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(SnapshotManagerController).whenTargetNamed('SnapshotManagerController');
        container.bind<expressInterfaces.Controller>(TYPE.Controller).to(AuthorizationController).whenTargetNamed('AuthorizationController');
        container.bind<ISubject<void>>("ProjectionStatuses").toConstantValue(new Subject<void>());
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        registry.add(SizeProjectionDefinition).forArea("__diagnostic");
        let authStrategy = serviceLocator.get<IAuthorizationStrategy>("IAuthorizationStrategy");
        app.use('/api', (request: Request, response: Response, next: NextFunction) => {
            authStrategy.authorize(request).then(authorized => {
                if (!authorized)
                    response.status(401).json({"error": "Not Authorized"});
                else
                    next();
            });
        });
    }
}

export default APIModule;
