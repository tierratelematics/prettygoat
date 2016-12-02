import Projection from "../registry/ProjectionDecorator";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import {IProjection} from "../projections/IProjection";
import {inject} from "inversify";
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import * as _ from "lodash";
import SplitProjectionRunner from "../projections/SplitProjectionRunner";
const sizeof = require("object-sizeof");
const humanize = require("humanize");

@Projection("Size")
class SizeProjectionDefinition implements IProjectionDefinition<any> {

    eventsCounter = 0;

    constructor(@inject("IProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>) {
    }

    define():IProjection<any> {
        return {
            name: "__diagnostic:Size",
            definition: {
                $init: () => {
                    return this.getProjectionsData().list;
                },
                $any: (state, payload, event) => {
                    this.eventsCounter++;
                    if (this.eventsCounter % 200 === 0)
                        return this.getProjectionsData();
                    return state;
                }
            }
        };
    }

    private getProjectionsData() {
        let totalSize = 0;
        let processedEvents = 0;
        let processedReadModels = 0;
        let projections = _.mapValues(this.holder, (runner:IProjectionRunner<any>, key) => {
            if (_.startsWith(key, "__diagnostic")) return;
            let size = sizeof(runner.state);
            totalSize += size;
            processedEvents += runner.stats.events;
            processedReadModels += runner.stats.readModels;
            let data = {
                size: humanize.filesize(size),
                events: runner.stats.events,
                readModels: runner.stats.readModels
            };
            if (runner instanceof SplitProjectionRunner) {
                _.assign(data, {
                    splits: _.keys(runner.state).length
                });
            }
            return data;
        });
        return {
            processedEvents: processedEvents,
            processedReadModels: processedReadModels,
            totalSize: humanize.filesize(totalSize),
            list: projections
        }
    }
}

export default SizeProjectionDefinition