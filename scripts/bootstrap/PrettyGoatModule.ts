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
import CassandraStreamFactory from "../streams/CassandraStreamFactory";
import CassandraDeserializer from "../streams/CassandraDeserializer";
import ICassandraDeserializer from "../streams/ICassandraDeserializer";
import {IStreamFactory} from "../streams/IStreamFactory";
import PollToPushStreamFactory from "../streams/PollToPushStreamFactory";
import ICassandraClientFactory from "../streams/ICassandraClientFactory";
import CassandraClientFactory from "../streams/CassandraClientFactory";
import SocketFactory from "../push/SocketFactory";
import ReadModelFactory from "../streams/ReadModelFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import IDateRetriever from "../util/IDateRetriever";
import DateRetriever from "../util/DateRetriever";
import ExpressStatePublisher from "../routing/ExpressStatePublisher";
import IStatePublisher from "../routing/IStatePublisher";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import CassandraSnapshotRepository from "../snapshots/CassandraSnapshotRepository";
import CountSnapshotStrategy from "../snapshots/CountSnapshotStrategy";
import TimeSnapshotStrategy from "../snapshots/TimeSnapshotStrategy";
import TimePartitioner from "../util/TimePartitioner";
import ProjectionRunnerFactory from "../projections/ProjectionRunnerFactory";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import IProjectionRunner from "../projections/IProjectionRunner";
import Dictionary from "../Dictionary";

class PrettyGoatModule implements IModule {

    modules = (kernel:interfaces.Kernel) => {
        kernel.bind<interfaces.Kernel>("Kernel").toConstantValue(kernel);
        kernel.bind<IProjectionRegistry>("IProjectionRegistry").to(ProjectionRegistry).inSingletonScope();
        kernel.bind<IProjectionRunnerFactory>("IProjectionRunnerFactory").to(ProjectionRunnerFactory).inSingletonScope();
        kernel.bind<IProjectionRouter>("IProjectionRouter").toConstantValue(ExpressApp);
        kernel.bind<IEventEmitter>("IEventEmitter").to(SocketEventEmitter).inSingletonScope();
        kernel.bind<IClientRegistry>("IClientRegistry").to(ClientRegistry).inSingletonScope();
        kernel.bind<ProjectionAnalyzer>("ProjectionAnalyzer").to(ProjectionAnalyzer).inSingletonScope();
        kernel.bind<IPushNotifier>("IPushNotifier").to(PushNotifier).inSingletonScope();
        kernel.bind<IProjectionEngine>("IProjectionEngine").to(ProjectionEngine).inSingletonScope();
        kernel.bind<IObjectContainer>("IObjectContainer").to(ObjectContainer).inSingletonScope();
        kernel.bind<IStreamFactory>("StreamFactory").to(CassandraStreamFactory).inSingletonScope().whenInjectedInto(PollToPushStreamFactory);
        kernel.bind<ICassandraDeserializer>("ICassandraDeserializer").to(CassandraDeserializer).inSingletonScope();
        kernel.bind<IStreamFactory>("IStreamFactory").to(PollToPushStreamFactory).inSingletonScope();
        kernel.bind<ICassandraClientFactory>("ICassandraClientFactory").to(CassandraClientFactory).inSingletonScope();
        kernel.bind<SocketFactory>("SocketFactory").to(SocketFactory).inSingletonScope();
        kernel.bind<IReadModelFactory>("IReadModelFactory").to(ReadModelFactory).inSingletonScope();
        kernel.bind<IDateRetriever>("IDateRetriever").to(DateRetriever).inSingletonScope();
        kernel.bind<TimePartitioner>("TimePartitioner").to(TimePartitioner).inSingletonScope();
        kernel.bind<IStatePublisher>("IStatePublisher").to(ExpressStatePublisher).inSingletonScope();
        kernel.bind<ISnapshotRepository>("ISnapshotRepository").to(CassandraSnapshotRepository).inSingletonScope();
        kernel.bind<CountSnapshotStrategy>("CountSnapshotStrategy").to(CountSnapshotStrategy).inSingletonScope();
        kernel.bind<TimeSnapshotStrategy>("TimeSnapshotStrategy").to(TimeSnapshotStrategy).inSingletonScope();
        kernel.bind<Dictionary<IProjectionRunner<any>>>("ProjectionRunnerHolder").toConstantValue({});
    };

    register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void {

    }
}

export default PrettyGoatModule;
