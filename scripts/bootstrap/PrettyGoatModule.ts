import IModule from "./IModule";
import {IKernelModule, IKernel} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "./IServiceLocator";
import ProjectionRegistry from "../registry/ProjectionRegistry";
import IProjectionRunnerFactory from "../projections/IProjectionRunnerFactory";
import ProjectionRunnerFactory from "../projections/ProjectionRunnerFactory";
import IProjectionRouter from "../push/IProjectionRouter";
import ExpressApp from "./ExpressApp";
import IEventEmitter from "../push/IEventEmitter";
import SocketEventEmitter from "../push/SocketEventEmitter";
import ClientRegistry from "../push/ClientRegistry";
import IClientRegistry from "../push/IClientRegistry";
import {ProjectionAnalyzer} from "../projections/ProjectionAnalyzer";
import PushNotifier from "../push/PushNotifier";
import IPushNotifier from "../push/IPushNotifier";
import {socket} from "./Socket";
import IProjectionEngine from "../projections/IProjectionEngine";
import ProjectionEngine from "../projections/ProjectionEngine";
import IObjectContainer from "./IObjectContainer";
import ObjectContainer from "./ObjectContainer";
import CassandraStreamFactory from "../streams/CassandraStreamFactory";
import SnapshotRepository from "../streams/SnapshotRepository";
import {IStreamFactory} from "../streams/IStreamFactory";
import {ISnapshotRepository} from "../streams/ISnapshotRepository";
import StreamState from "../streams/StreamState";

class PrettyGoatModule implements IModule {

    modules:IKernelModule = (kernel:IKernel) => {
        kernel.bind<IKernel>("IKernel").toConstantValue(kernel);
        kernel.bind<IProjectionRegistry>("IProjectionRegistry").to(ProjectionRegistry).inSingletonScope();
        kernel.bind<IProjectionRunnerFactory>("IProjectionRunnerFactory").to(ProjectionRunnerFactory).inSingletonScope();
        kernel.bind<IProjectionRouter>("IProjectionRouter").toConstantValue(ExpressApp);
        kernel.bind<IEventEmitter>("IEventEmitter").to(SocketEventEmitter).inSingletonScope();
        kernel.bind<SocketIO.Socket>("SocketIO.Socket").toConstantValue(socket);
        kernel.bind<IClientRegistry>("IClientRegistry").to(ClientRegistry).inSingletonScope();
        kernel.bind<ProjectionAnalyzer>("ProjectionAnalyzer").to(ProjectionAnalyzer).inSingletonScope();
        kernel.bind<IPushNotifier>("IPushNotifier").to(PushNotifier).inSingletonScope();
        kernel.bind<IProjectionEngine>("IProjectionEngine").to(ProjectionEngine).inSingletonScope();
        kernel.bind<IObjectContainer>("IObjectContainer").to(ObjectContainer).inSingletonScope();
        kernel.bind<IStreamFactory>("IStreamFactory").to(CassandraStreamFactory).inSingletonScope();
        kernel.bind<ISnapshotRepository>("ISnapshotRepository").to(SnapshotRepository).inSingletonScope();
        kernel.bind<StreamState>("StreamState").to(StreamState).inSingletonScope();
    };

    register(registry:IProjectionRegistry, serviceLocator?:IServiceLocator, overrides?:any):void {

    }
}

export default PrettyGoatModule;
