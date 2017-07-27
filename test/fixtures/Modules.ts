import {Predicates, FeatureToggle} from "bivio";
import IModule from "../../scripts/bootstrap/IModule";
import IServiceLocator from "../../scripts/bootstrap/IServiceLocator";
import {IProjectionRegistry} from "../../scripts/bootstrap/ProjectionRegistry";

@FeatureToggle(Predicates.always)
export class ValidModule implements IModule {
    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }
}

@FeatureToggle(Predicates.never)
export class DisabledModule implements IModule {
    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }
}

export class WithoutFTModule implements IModule {
    register(registry: IProjectionRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
    }
}