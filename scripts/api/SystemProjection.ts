import Projection from "../registry/ProjectionDecorator";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import {IProjection} from "../projections/IProjection";
import {inject} from "inversify";
import Dictionary from "../util/Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import * as _ from "lodash";
import TickScheduler from "../ticks/TickScheduler";
import IProjectionSorter from "../projections/IProjectionSorter";
import IProjectionRegistry from "../registry/IProjectionRegistry";
const sizeof = require("object-sizeof");
const humanize = require("humanize");

@Projection("System")
class SystemProjection implements IProjectionDefinition<any> {

    constructor(@inject("IProjectionRunnerHolder") private holder: Dictionary<IProjectionRunner<any>>,
                @inject("IProjectionSorter") private projectionSorter: IProjectionSorter,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry) {
    }

    define(tickScheduler: TickScheduler): IProjection<any> {
        let eventsCounter = 0;
        return {
            name: "__diagnostic:System",
            definition: {
                $init: () => {
                    return {
                        events: 0,
                        projections: this.getProjectionsList()
                    };
                },
                $any: (state) => {
                    eventsCounter++;
                    if (eventsCounter % 200 === 0)
                        return {
                            events: eventsCounter,
                            projections: this.getProjectionsList()
                        };
                    return state;
                }
            }
        };
    }

    private getProjectionsList() {
        return _.mapValues(this.holder, (runner: IProjectionRunner<any>, key: string) => {
            if (_.startsWith(key, "__diagnostic"))
                return undefined;
            let projection: IProjection<any> = this.registry.getEntry(key, null).data.projection;
            return {
                dependencies: this.projectionSorter.dependencies(projection)
            };
        });
    }
}

export default SystemProjection