import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../ioc/IServiceLocator";
import IProjectionEngine from "../projections/IProjectionEngine";
import ProjectionEngine from "../projections/ProjectionEngine";
import ClusteredProjectionEngine from "./ClusteredProjectionEngine";
import ICluster from "./ICluster";
import Cluster from "./Cluster";
import {ISocketFactory} from "../push/IPushComponents";
import ClusteredSocketFactory from "./ClusteredSocketFactory";
import IReadModelFactory from "../streams/IReadModelFactory";
import ReadModelFactory from "../streams/ReadModelFactory";
import ClusteredReadModelFactory from "./ClusteredReadModelFactory";
import {IReplicationManager} from "../bootstrap/ReplicationManager";
import ClusteredReplicationManager from "./ClusteredReplicationManager";
import ILogger from "../log/ILogger";
import ConsoleLogger from "../log/ConsoleLogger";
import ProcessLogger from "./ProcessLogger";
import {IRequestAdapter} from "../web/IRequestComponents";
import ClusteredRequestAdapter from "./ClusteredRequestAdapter";

class ClusterModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.unbind("IProjectionEngine");
        container.bind<IProjectionEngine>("ProjectionEngine").to(ProjectionEngine).inSingletonScope().whenInjectedInto(ClusteredProjectionEngine);
        container.bind<IProjectionEngine>("IProjectionEngine").to(ClusteredProjectionEngine).inSingletonScope();
        container.bind<ICluster>("ICluster").to(Cluster).inSingletonScope();
        container.unbind("ISocketFactory");
        container.bind<ISocketFactory>("ISocketFactory").to(ClusteredSocketFactory).inSingletonScope();
        container.unbind("IReadModelFactory");
        container.bind<IReadModelFactory>("ReadModelFactory").to(ReadModelFactory).inSingletonScope();
        container.bind<IReadModelFactory>("IReadModelFactory").to(ClusteredReadModelFactory).inSingletonScope();
        container.unbind("IReplicationManager");
        container.bind<IReplicationManager>("IReplicationManager").to(ClusteredReplicationManager).inSingletonScope();
        container.unbind("ILogger");
        container.bind<ILogger>("Logger").to(ConsoleLogger).whenInjectedInto(ProcessLogger);
        container.bind<ILogger>("ILogger").to(ProcessLogger).inSingletonScope();
        container.unbind("IRequestAdapter");
        container.bind<IRequestAdapter>("IRequestAdapter").to(ClusteredRequestAdapter).inSingletonScope();
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {

    }

}

export default ClusterModule