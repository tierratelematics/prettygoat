import IModule from "./IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "./IServiceLocator";
import ProjectionRegistry from "../registry/ProjectionRegistry";
import IProjectionRouter from "../routing/IProjectionRouter";
import ExpressApp from "./ExpressApp";
import IEventEmitter from "../push/IEventEmitter";
import SocketEventEmitter from "../push/SocketEventEmitter";
import ClientRegistry from "../push/ClientRegistry";
import IClientRegistry from "../push/IClientRegistry";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";
import PushNotifier from "../push/PushNotifier";
import IPushNotifier from "../push/IPushNotifier";
import IProjectionEngine from "../projections/IProjectionEngine";
import ProjectionEngine from "../projections/ProjectionEngine";
import IObjectContainer from "./IObjectContainer";
import ObjectContainer from "./ObjectContainer";
import CassandraStreamFactory from "../cassandra/CassandraStreamFactory";
import CassandraDeserializer from "../cassandra/CassandraDeserializer";
import ICassandraDeserializer from "../cassandra/ICassandraDeserializer";
import {IStreamFactory} from "../streams/IStreamFactory";
import PollToPushStreamFactory from "../streams/PollToPushStreamFactory";
import SocketFactory from "../push/SocketFactory";
import ReadModelFactory from "../streams/ReadModelFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import IDateRetriever from "../util/IDateRetriever";
import DateRetriever from "../util/DateRetriever";
import ExpressStatePublisher from "../routing/ExpressStatePublisher";
import IStatePublisher from "../routing/IStatePublisher";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import CassandraSnapshotRepository from "../cassandra/CassandraSnapshotRepository";
import CountSnapshotStrategy from "../snapshots/CountSnapshotStrategy";
import TimeSnapshotStrategy from "../snapshots/TimeSnapshotStrategy";
import TimePartitioner from "../util/TimePartitioner";
import ProjectionRunnerFactory from "../projections/ProjectionRunnerFactory";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import IProjectionRunner from "../projections/IProjectionRunner";
import Dictionary from "../Dictionary";
import ILogger from "../log/ILogger";
import ConsoleLogger from "../log/ConsoleLogger";
import ITickScheduler from "../ticks/ITickScheduler";
import TickScheduler from "../ticks/TickScheduler";
import EventsFilter from "../streams/EventsFilter";
import IEventsFilter from "../streams/IEventsFilter";
import ICassandraClient from "../cassandra/ICassandraClient";
import CassandraClient from "../cassandra/CassandraClient";
import IProjectionSorter from "../projections/IProjectionSorter";
import ProjectionSorter from "../projections/ProjectionSorter";

class PrettyGoatModule implements IModule {

    modules = (container:interfaces.Container) => {
        container.bind<interfaces.Container>("Container").toConstantValue(container);
        container.bind<IProjectionRegistry>("IProjectionRegistry").to(ProjectionRegistry).inSingletonScope();
        container.bind<IProjectionRunnerFactory>("IProjectionRunnerFactory").to(ProjectionRunnerFactory).inSingletonScope();
        container.bind<IProjectionRouter>("IProjectionRouter").toConstantValue(ExpressApp);
        container.bind<IEventEmitter>("IEventEmitter").to(SocketEventEmitter).inSingletonScope();
        container.bind<IClientRegistry>("IClientRegistry").to(ClientRegistry).inSingletonScope();
        container.bind<ProjectionAnalyzer>("ProjectionAnalyzer").to(ProjectionAnalyzer).inSingletonScope();
        container.bind<IPushNotifier>("IPushNotifier").to(PushNotifier).inSingletonScope();
        container.bind<IProjectionEngine>("IProjectionEngine").to(ProjectionEngine).inSingletonScope();
        container.bind<IObjectContainer>("IObjectContainer").to(ObjectContainer).inSingletonScope();
        container.bind<IStreamFactory>("StreamFactory").to(CassandraStreamFactory).inSingletonScope().whenInjectedInto(PollToPushStreamFactory);
        container.bind<ICassandraDeserializer>("ICassandraDeserializer").to(CassandraDeserializer).inSingletonScope();
        container.bind<ICassandraClient>("ICassandraClient").to(CassandraClient).inSingletonScope();
        container.bind<IStreamFactory>("IStreamFactory").to(PollToPushStreamFactory).inSingletonScope();
        container.bind<SocketFactory>("SocketFactory").to(SocketFactory).inSingletonScope();
        container.bind<IReadModelFactory>("IReadModelFactory").to(ReadModelFactory).inSingletonScope();
        container.bind<IDateRetriever>("IDateRetriever").to(DateRetriever).inSingletonScope();
        container.bind<IProjectionSorter>("IProjectionSorter").to(ProjectionSorter).inSingletonScope();
        container.bind<TimePartitioner>("TimePartitioner").to(TimePartitioner).inSingletonScope();
        container.bind<IStatePublisher>("IStatePublisher").to(ExpressStatePublisher).inSingletonScope();
        container.bind<ISnapshotRepository>("ISnapshotRepository").to(CassandraSnapshotRepository).inSingletonScope();
        container.bind<CountSnapshotStrategy>("CountSnapshotStrategy").to(CountSnapshotStrategy).inSingletonScope();
        container.bind<TimeSnapshotStrategy>("TimeSnapshotStrategy").to(TimeSnapshotStrategy).inSingletonScope();
        container.bind<Dictionary<IProjectionRunner<any>>>("IProjectionRunnerHolder").toConstantValue({});
        container.bind<Dictionary<ITickScheduler>>("ITickSchedulerHolder").toConstantValue({});
        container.bind<ILogger>("ILogger").to(ConsoleLogger).inSingletonScope();
        container.bind<ITickScheduler>("ITickScheduler").to(TickScheduler);
        container.bind<interfaces.Factory<ITickScheduler>>("Factory<ITickScheduler>").toAutoFactory<ITickScheduler>("ITickScheduler");
        container.bind<IEventsFilter>("IEventsFilter").to(EventsFilter).inSingletonScope();
    };

    register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void {
    }
}

export default PrettyGoatModule;
