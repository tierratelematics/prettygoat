import IModule from "../bootstrap/IModule";
import {interfaces} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import IServiceLocator from "../ioc/IServiceLocator";
import IProjectionEngine from "../projections/IProjectionEngine";
import ProjectionEngine from "../projections/ProjectionEngine";
import ClusteredProjectionEngine from "./ClusteredProjectionEngine";
import ICluster from "./ICluster";
import Cluster from "./Cluster";
import {ISocketFactory} from "../web/IPushComponents";
import ClusteredSocketFactory from "./ClusteredSocketFactory";

class ClusterModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.unbind("IProjectionEngine");
        container.bind<IProjectionEngine>("ProjectionEngine").to(ProjectionEngine).inSingletonScope().whenInjectedInto(ClusteredProjectionEngine);
        container.bind<IProjectionEngine>("IProjectionEngine").to(ClusteredProjectionEngine).inSingletonScope();
        container.bind<ICluster>("ICluster").to(Cluster).inSingletonScope();
        container.unbind("ISocketFactory");
        container.bind<ISocketFactory>("ISocketFactory").to(ClusteredSocketFactory).inSingletonScope();
    };

    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }

}

export default ClusterModule