import {IProjection, IProjectionDefinition} from "./IProjection";
import {inject, interfaces, multiInject} from "inversify";
import IObjectContainer from "../bootstrap/IObjectContainer";
import {forEach} from "lodash";
import {IReadModelDefinition} from "../readmodels/IReadModel";

export interface IProjectionFactory {
    create<T>(constructor: interfaces.Newable<IProjectionDefinition<T> | IReadModelDefinition<T>>): IProjection<T>;
}

export interface IProjectionFactoryExtender {
    extend(definition: any);
}

export class ProjectionFactory implements IProjectionFactory {

    constructor(@inject("IObjectContainer") private objectContainer: IObjectContainer,
                @multiInject("IProjectionFactoryExtender") private extenders: IProjectionFactoryExtender[]) {

    }

    create<T>(constructor: interfaces.Newable<IProjectionDefinition<T> | IReadModelDefinition<T>>): IProjection<T> {
        let definition = this.objectContainer.resolve<IProjectionDefinition<T> | IReadModelDefinition<T>>(constructor);
        forEach(this.extenders, extender => extender.extend(definition));
        return definition.define();
    }

}
