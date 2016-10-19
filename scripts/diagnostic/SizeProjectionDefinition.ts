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

    constructor(@inject("ProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>) {

    }

    define():IProjection<any> {
        return {
            name: "__diagnostic:Size",
            definition: {
                $init: () => this.getProjectionsSize(),
                $any: (state) => {
                    this.eventsCounter++;
                    if (this.eventsCounter % 200 === 0) {
                        return {
                            totalEvents: this.eventsCounter,
                            projections: this.getProjectionsSize()
                        }
                    }
                    return {
                        totalEvents: this.eventsCounter,
                        projections: state.projections
                    }
                }
            }
        };
    }

    private getProjectionsSize() {
        return _.mapValues(this.holder, (runner:IProjectionRunner<any>) => {
            let data = {
                size: humanize.filesize(sizeof(runner.state))
            };
            if (runner instanceof SplitProjectionRunner) {
                _.assign(data, {
                    splits: _.keys(runner.state).length
                });
            }
            return data;
        });
    }
}

export default SizeProjectionDefinition