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
import {IMessageParser} from "../web/IRequestComponents";
import ClusterMessageParser from "./ClusterMessageParser";
import IReadModelFactory from "../streams/IReadModelFactory";
import ReadModelFactory from "../streams/ReadModelFactory";
import ClusteredReadModelFactory from "./ClusteredReadModelFactory";

class ClusterModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.unbind("IProjectionEngine");
        container.bind<IProjectionEngine>("ProjectionEngine").to(ProjectionEngine).inSingletonScope().whenInjectedInto(ClusteredProjectionEngine);
        container.bind<IProjectionEngine>("IProjectionEngine").to(ClusteredProjectionEngine).inSingletonScope();
        container.bind<ICluster>("ICluster").to(Cluster).inSingletonScope();
        container.unbind("ISocketFactory");
        container.bind<ISocketFactory>("ISocketFactory").to(ClusteredSocketFactory).inSingletonScope();
        container.bind<IMessageParser<any,any>>("IMessageParser").to(ClusterMessageParser).whenInjectedInto(Cluster).inSingletonScope();
        container.unbind("IReadModelFactory");
        container.bind<IReadModelFactory>("ReadModelFactory").to(ReadModelFactory).inSingletonScope();
        container.bind<IReadModelFactory>("IReadModelFactory").to(ClusteredReadModelFactory).inSingletonScope();
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {

    }

}

export default ClusterModule