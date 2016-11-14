import Projection from "../registry/ProjectionDecorator";
import IProjectionDefinition from "../registry/IProjectionDefinition";
import {IProjection} from "../projections/IProjection";
import {inject} from "inversify";
import Dictionary from "../Dictionary";
import IProjectionRunner from "../projections/IProjectionRunner";
import * as _ from "lodash";
import SplitProjectionRunner from "../projections/SplitProjectionRunner";
import IDependencyDefinition from "../dependency/IDependencyDefinition";
const sizeof = require("object-sizeof");
const humanize = require("humanize");

@Projection("Size")
class SizeProjectionDefinition implements IProjectionDefinition<any> {

    eventsCounter = 0;
    readModels:string[] = [];


    constructor(@inject("IProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>,
                @inject("IDependencyDefinition") private dependency:IDependencyDefinition
    ) {
    }

    define():IProjection<any> {
        return {
            name: "__diagnostic:Size",
            definition: {
                $init: () => {
                    this.readModels = _.keys(this.holder);
                    return this.getProjectionsSize()[1];
                },
                $any: (state, payload, event) => {
                    if (_.includes(this.readModels, event.type))
                        return state;

                    this.eventsCounter++;
                    if (this.eventsCounter % 200 === 0) {
                        let sizes = this.getProjectionsSize();
                        return {
                            totalEvents: this.eventsCounter,
                            totalSize: humanize.filesize(sizes[0]),
                            projections: sizes[1]
                        }
                    }
                    return {
                        totalEvents: this.eventsCounter,
                        totalSize: state.totalSize,
                        projections: state.projections
                    }
                }
            }
        };
    }

    private getProjectionsSize() {
        let total = 0;
        let projections = _.mapValues(this.holder, (runner:IProjectionRunner<any>) => {
            let size = sizeof(runner.state);
            total += size;
            let data = {
                size: humanize.filesize(size)
            };
            if (runner instanceof SplitProjectionRunner) {
                _.assign(data, {
                    splits: _.keys(runner.state).length
                });
            }
            return data;
        });

        return [total, projections];
    }
}

export default SizeProjectionDefinition