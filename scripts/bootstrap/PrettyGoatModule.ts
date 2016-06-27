import IModule from "./IModule";
import {IKernelModule, IKernel} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "./IServiceLocator";
import ProjectionRegistry from "../registry/ProjectionRegistry";
import IProjectionHandlerFactory from "../projections/IProjectionHandlerFactory";
import ProjectionHandlerFactory from "../projections/ProjectionHandlerFactory";
import IProjectionRouter from "../push/IProjectionRouter";
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
import SnapshotRepository from "../snapshots/SnapshotRepository";
import {IStreamFactory} from "../streams/IStreamFactory";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import StreamState from "../streams/StreamState";
import PollToPushStreamFactory from "../streams/PollToPushStreamFactory";
import ICassandraClientFactory from "../streams/ICassandraClientFactory";
import CassandraClientFactory from "../streams/CassandraClientFactory";
import SocketFactory from "../push/SocketFactory";
import ReadModelFactory from "../streams/ReadModelFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import IDateRetriever from "../util/IDateRetriever";
import DateRetriever from "../util/DateRetriever";
import TimePartitioner from "../util/TimePartitioner";
import IProjectionSelector from "../projections/IProjectionSelector";
import ProjectionSelector from "../projections/ProjectionSelector";

class PrettyGoatModule implements IModule {

    modules:IKernelModule = (kernel:IKernel) => {
        kernel.bind<IKernel>("IKernel").toConstantValue(kernel);
        kernel.bind<IProjectionRegistry>("IProjectionRegistry").to(ProjectionRegistry).inSingletonScope();
        kernel.bind<IProjectionHandlerFactory>("IProjectionHandlerFactory").to(ProjectionHandlerFactory).inSingletonScope();
        kernel.bind<IProjectionRouter>("IProjectionRouter").toConstantValue(ExpressApp);
        kernel.bind<IEventEmitter>("IEventEmitter").to(SocketEventEmitter).inSingletonScope();
        kernel.bind<IClientRegistry>("IClientRegistry").to(ClientRegistry).inSingletonScope();
        kernel.bind<ProjectionAnalyzer>("ProjectionAnalyzer").to(ProjectionAnalyzer).inSingletonScope();
        kernel.bind<IPushNotifier>("IPushNotifier").to(PushNotifier).inSingletonScope();
        kernel.bind<IProjectionEngine>("IProjectionEngine").to(ProjectionEngine).inSingletonScope();
        kernel.bind<IObjectContainer>("IObjectContainer").to(ObjectContainer).inSingletonScope();
        kernel.bind<IStreamFactory>("StreamFactory").to(CassandraStreamFactory).inSingletonScope().whenInjectedInto(PollToPushStreamFactory);
        kernel.bind<ISnapshotRepository>("ISnapshotRepository").to(SnapshotRepository).inSingletonScope();
        kernel.bind<StreamState>("StreamState").to(StreamState).inSingletonScope();
        kernel.bind<IStreamFactory>("IStreamFactory").to(PollToPushStreamFactory).inSingletonScope();
        kernel.bind<ICassandraClientFactory>("ICassandraClientFactory").to(CassandraClientFactory).inSingletonScope();
        kernel.bind<SocketFactory>("SocketFactory").to(SocketFactory).inSingletonScope();
        kernel.bind<IReadModelFactory>("IReadModelFactory").to(ReadModelFactory).inSingletonScope();
        kernel.bind<IDateRetriever>("IDateRetriever").to(DateRetriever).inSingletonScope();
        kernel.bind<TimePartitioner>("TimePartitioner").to(TimePartitioner).inSingletonScope();
        kernel.bind<IProjectionSelector>("IProjectionSelector").to(ProjectionSelector).inSingletonScope();
    };

    register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void {

    }
}

export default PrettyGoatModule;
