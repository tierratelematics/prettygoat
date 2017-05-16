import IModule from "./IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../ioc/IServiceLocator";
import ProjectionRegistry from "../registry/ProjectionRegistry";
import IProjectionEngine from "../projections/IProjectionEngine";
import ProjectionEngine from "../projections/ProjectionEngine";
import IObjectContainer from "../ioc/IObjectContainer";
import ObjectContainer from "../ioc/ObjectContainer";
import ReadModelFactory from "../streams/ReadModelFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import IDateRetriever from "../util/IDateRetriever";
import DateRetriever from "../util/DateRetriever";
import CountSnapshotStrategy from "../snapshots/CountSnapshotStrategy";
import TimeSnapshotStrategy from "../snapshots/TimeSnapshotStrategy";
import ProjectionRunnerFactory from "../projections/ProjectionRunnerFactory";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import IProjectionRunner from "../projections/IProjectionRunner";
import Dictionary from "../util/Dictionary";
import ILogger from "../log/ILogger";
import ConsoleLogger from "../log/ConsoleLogger";
import ITickScheduler from "../ticks/ITickScheduler";
import TickScheduler from "../ticks/TickScheduler";
import IProjectionSorter from "../projections/IProjectionSorter";
import ProjectionSorter from "../projections/ProjectionSorter";
import PushNotifier from "../push/PushNotifier";
import {IPushNotifier, IClientRegistry, IEventEmitter, ISocketFactory} from "../push/IPushComponents";
import ClientRegistry from "../push/ClientRegistry";
import SocketEventEmitter from "../push/SocketEventEmitter";
import SocketFactory from "../push/SocketFactory";
import {
    IRequestAdapter, IRouteResolver, IRequestHandler,
    IMiddleware, IRequestParser, IMiddlewareTransformer
} from "../web/IRequestComponents";
import RequestAdapter from "../web/RequestAdapter";
import RouteResolver from "../web/RouteResolver";
import ProjectionStateHandler from "../projections/ProjectionStateHandler";
import CORSMiddleware from "../web/CORSMiddlware";
import BodyMiddleware from "../web/BodyMiddleware";
import RequestParser from "../web/RequestParser";
import MemoizingProjectionRegistry from "../registry/MemoizingProjectionRegistry";
import MemoizingProjectionSorter from "../projections/MemoizingProjectionSorter";
import {IReplicationManager, ReplicationManager} from "./ReplicationManager";
import MiddlewareTransformer from "../web/MiddlewareTransformer";
import DebouncePublisher from "../util/DebouncePublisher";
import IAsyncPublisher from "../util/IAsyncPublisher";
import IServerProvider from "../web/IServerProvider";
import ServerProvider from "../web/ServerProvider";
import HealthCheckHandler from "../web/HealthCheckHandler";
import {ILookupService, LookupService} from "../lookup/Lookup";

class PrettyGoatModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<interfaces.Container>("Container").toConstantValue(container);
        container.bind<IProjectionRegistry>("ProjectionRegistry").to(ProjectionRegistry).whenInjectedInto(MemoizingProjectionRegistry);
        container.bind<IProjectionRegistry>("IProjectionRegistry").to(MemoizingProjectionRegistry).inSingletonScope();
        container.bind<IProjectionRunnerFactory>("IProjectionRunnerFactory").to(ProjectionRunnerFactory).inSingletonScope();
        container.bind<IEventEmitter>("IEventEmitter").to(SocketEventEmitter).inSingletonScope();
        container.bind<IClientRegistry>("IClientRegistry").to(ClientRegistry).inSingletonScope();
        container.bind<IPushNotifier>("IPushNotifier").to(PushNotifier).inSingletonScope();
        container.bind<IProjectionEngine>("IProjectionEngine").to(ProjectionEngine).inSingletonScope();
        container.bind<IObjectContainer>("IObjectContainer").to(ObjectContainer).inSingletonScope();
        container.bind<ISocketFactory>("ISocketFactory").to(SocketFactory).inSingletonScope();
        container.bind<IReadModelFactory>("IReadModelFactory").to(ReadModelFactory).inSingletonScope();
        container.bind<IDateRetriever>("IDateRetriever").to(DateRetriever).inSingletonScope();
        container.bind<IProjectionSorter>("IProjectionSorter").to(MemoizingProjectionSorter).inSingletonScope();
        container.bind<IProjectionSorter>("ProjectionSorter").to(ProjectionSorter).whenInjectedInto(MemoizingProjectionSorter);
        container.bind<CountSnapshotStrategy>("CountSnapshotStrategy").to(CountSnapshotStrategy);
        container.bind<TimeSnapshotStrategy>("TimeSnapshotStrategy").to(TimeSnapshotStrategy);
        container.bind<Dictionary<IProjectionRunner<any>>>("IProjectionRunnerHolder").toConstantValue({});
        container.bind<Dictionary<ITickScheduler>>("ITickSchedulerHolder").toConstantValue({});
        container.bind<ILogger>("ILogger").to(ConsoleLogger).inSingletonScope();
        container.bind<ITickScheduler>("ITickScheduler").to(TickScheduler);
        container.bind<interfaces.Factory<ITickScheduler>>("Factory<ITickScheduler>").toAutoFactory<ITickScheduler>("ITickScheduler");
        container.bind<IRequestAdapter>("IRequestAdapter").to(RequestAdapter).inSingletonScope();
        container.bind<IMiddlewareTransformer>("IMiddlewareTransformer").to(MiddlewareTransformer).inSingletonScope();
        container.bind<IRouteResolver>("IRouteResolver").to(RouteResolver).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(ProjectionStateHandler).inSingletonScope();
        container.bind<IRequestHandler>("IRequestHandler").to(HealthCheckHandler).inSingletonScope();
        container.bind<IRequestParser>("IRequestParser").to(RequestParser).inSingletonScope();
        container.bind<IMiddleware>("IMiddleware").to(CORSMiddleware).inSingletonScope();
        container.bind<IMiddleware>("IMiddleware").to(BodyMiddleware).inSingletonScope();
        container.bind<IReplicationManager>("IReplicationManager").to(ReplicationManager).inSingletonScope();
        container.bind<IAsyncPublisher<any>>("IAsyncPublisher").to(DebouncePublisher);
        container.bind<IServerProvider>("IServerProvider").to(ServerProvider).inSingletonScope();
        container.bind<ILookupService>("ILookupService").to(LookupService).inSingletonScope();
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }
}

export default PrettyGoatModule;
