import IModule from "./IModule";
import {interfaces} from "inversify";
import IServiceLocator from "./IServiceLocator";
import IProjectionEngine from "../projections/IProjectionEngine";
import ProjectionEngine from "../projections/ProjectionEngine";
import IObjectContainer from "./IObjectContainer";
import ObjectContainer from "./ObjectContainer";
import IDateRetriever from "../common/IDateRetriever";
import DateRetriever from "../common/DateRetriever";
import CountSnapshotStrategy from "../snapshots/CountSnapshotStrategy";
import TimeSnapshotStrategy from "../snapshots/TimeSnapshotStrategy";
import ProjectionRunnerFactory from "../projections/ProjectionRunnerFactory";
import Dictionary from "../common/Dictionary";
import PushNotifier from "../push/PushNotifier";
import {IPushNotifier, IClientRegistry, IEventEmitter, ISocketFactory} from "../push/PushComponents";
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
import {IReplicationManager, ReplicationManager} from "./ReplicationManager";
import MiddlewareTransformer from "../web/MiddlewareTransformer";
import DebouncePublisher from "../common/BackpressurePublisher";
import IAsyncPublisher from "../common/IAsyncPublisher";
import IServerProvider from "../web/IServerProvider";
import ServerProvider from "../web/ServerProvider";
import HealthCheckHandler from "../web/HealthCheckHandler";
import {ProjectionStreamFactory} from "../projections/ProjectionStreamFactory";
import {IProjectionRunner} from "../projections/IProjectionRunner";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import * as Redis from "ioredis";
import {isArray} from "lodash";
import {IProjectionRegistry, ProjectionRegistry} from "./ProjectionRegistry";
import {IReadModelRetriever, ReadModelRetriever} from "../readmodels/ReadModelRetriever";
import {IReadModelNotifier, ReadModelNotifier} from "../readmodels/ReadModelNotifier";
import {AsyncPublisherFactory, IAsyncPublisherFactory} from "../common/AsyncPublisherFactory";
import {DefaultEndpointConfig, IEndpointConfig} from "../configs/EndpointConfig";
import {DefaultSocketConfig, ISocketConfig} from "../configs/SocketConfig";
import {DefaultNotificationConfig, INotificationConfig} from "../configs/NotificationConfig";
import {IProjectionFactory, ProjectionFactory} from "../projections/ProjectionFactory";
import {IRedisConfig} from "../configs/IRedisConfig";
import {IStreamFactory} from "../events/IStreamFactory";
import {IIdempotenceFilter} from "../events/IdempotenceFilter";
import {ISnapshotProducer, SnapshotProducer} from "../snapshots/SnapshotProducer";
import {activateLogging, ILogger} from "inversify-logging";

class PrettyGoatModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<interfaces.Container>("Container").toConstantValue(container);
        container.bind<IEndpointConfig>("IEndpointConfig").to(DefaultEndpointConfig).inSingletonScope();
        container.bind<ISocketConfig>("ISocketConfig").to(DefaultSocketConfig).inSingletonScope();
        container.bind<INotificationConfig>("INotificationConfig").to(DefaultNotificationConfig).inSingletonScope();
        container.bind<IProjectionRegistry>("IProjectionRegistry").to(ProjectionRegistry).inSingletonScope();
        container.bind<IProjectionFactory>("IProjectionFactory").to(ProjectionFactory).inSingletonScope();
        container.bind<IProjectionRunnerFactory>("IProjectionRunnerFactory").to(ProjectionRunnerFactory).inSingletonScope();
        container.bind<IEventEmitter>("IEventEmitter").to(SocketEventEmitter).inSingletonScope();
        container.bind<IClientRegistry>("IClientRegistry").to(ClientRegistry).inSingletonScope();
        container.bind<IPushNotifier>("IPushNotifier").to(PushNotifier).inSingletonScope();
        container.bind<IProjectionEngine>("IProjectionEngine").to(ProjectionEngine).inSingletonScope();
        container.bind<IObjectContainer>("IObjectContainer").to(ObjectContainer).inSingletonScope();
        container.bind<ISocketFactory>("ISocketFactory").to(SocketFactory).inSingletonScope();
        container.bind<IDateRetriever>("IDateRetriever").to(DateRetriever).inSingletonScope();
        container.bind<CountSnapshotStrategy>("CountSnapshotStrategy").to(CountSnapshotStrategy);
        container.bind<TimeSnapshotStrategy>("TimeSnapshotStrategy").to(TimeSnapshotStrategy);
        container.bind<Dictionary<IProjectionRunner<any>>>("IProjectionRunnerHolder").toConstantValue({});
        container.bind<Dictionary<IIdempotenceFilter>>("IdempotenceFilterHolder").toConstantValue({});
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
        container.bind<IStreamFactory>("IProjectionStreamFactory").to(ProjectionStreamFactory).inSingletonScope();
        container.bind<IReadModelRetriever>("IReadModelRetriever").to(ReadModelRetriever).inSingletonScope();
        container.bind<IReadModelNotifier>("IReadModelNotifier").to(ReadModelNotifier).inSingletonScope();
        container.bind<IAsyncPublisherFactory>("IAsyncPublisherFactory").to(AsyncPublisherFactory).inSingletonScope();
        container.bind<ISnapshotProducer>("ISnapshotProducer").to(SnapshotProducer).inSingletonScope();
        container.bind<Redis.Redis>("RedisClient").toDynamicValue(() => {
            let logger = container.get<ILogger>("ILogger").createChildLogger("RedisClient"),
                config = container.get<IRedisConfig>("IRedisConfig"),
                instance = isArray(config) ? new Redis.Cluster(config) : new Redis(config);
            instance.on("error", logger.error.bind(logger));

            return instance;
        });
        activateLogging(container);
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {

    }
}

export default PrettyGoatModule;
