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

    constructor(@inject("ProjectionRunnerHolder") private holder:Dictionary<IProjectionRunner<any>>) {

    }

    define():IProjection<any> {
        return {
            name: "__diagnostic:Size",
            definition: {
                $init: () => this.getProjectionsSize(),
                $any: () => this.getProjectionsSize()
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