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
    readModels:string[] = [];

    constructor(@inject("IProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>) {

    }

    define():IProjection<any> {
        return {
            name: "__diagnostic:Size",
            definition: {
                $init: () => {
                    this.readModels = _.keys(this.holder);
                    return this.getProjectionsData().list;
                },
                $any: (state, payload, event) => {
                    if (_.includes(this.readModels, event.type))
                        return state;
                    this.eventsCounter++;
                    if (this.eventsCounter % 200 === 0) {
                        let data = this.getProjectionsData();
                        return {
                            totalEvents: this.eventsCounter,
                            processedEvents: data.processedEvents,
                            processedReadModels: data.processedReadModels,
                            totalSize: humanize.filesize(data.totalSize),
                            projections: data.list
                        }
                    }
                    return {
                        totalEvents: this.eventsCounter,
                        processedEvents: state.processedEvents,
                        processedReadModels: state.processedReadModels,
                        totalSize: state.totalSize,
                        projections: state.projections
                    }
                }
            }
        };
    }

    private getProjectionsData() {
        let totalSize = 0;
        let processedEvents = 0;
        let processedReadModels = 0;
        let projections = _.mapValues(this.holder, (runner:IProjectionRunner<any>) => {
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
            totalSize: totalSize,
            list: projections,
            processedEvents: processedEvents,
            processedReadModels: processedReadModels
        }
    }
}

export default SizeProjectionDefinition