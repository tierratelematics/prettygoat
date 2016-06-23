import IProjectionSelector from "./IProjectionSelector";
import IProjectionRunner from "./IProjectionRunner";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import Event from "../streams/Event";
import IPushNotifier from "../push/IPushNotifier";
import {inject, injectable} from "inversify";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import PushContext from "../push/PushContext";
import {IMatcher} from "../matcher/IMatcher";
import {Matcher} from "../matcher/Matcher";
import * as Rx from "rx";

@injectable()
class ProjectionSelector implements IProjectionSelector {

    private runners:RunnerEntry<any>[] = [];

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory,
                @inject("IPushNotifier") private pushNotifier:IPushNotifier) {

    }

    addProjections(areaRegistry:AreaRegistry):void {
        _.forEach<RegistryEntry<any>>(areaRegistry.entries, (entry:RegistryEntry<any>) => {
            let runner = this.runnerFactory.create(entry.projection);
            this.pushNotifier.register(runner, new PushContext(areaRegistry.area, entry.name), entry.parametersKey);
            runner.run();
            this.runners.push({
                handlers: [{runner: runner}],
                area: areaRegistry.area,
                viewmodelId: entry.name,
                matcher: new Matcher(entry.projection.definition),
                splitMatcher: entry.projection.split ? new Matcher(entry.projection.split) : null
            });
        });
    }

    projectionsFor(event:Event):IProjectionRunner<any>[] {
        return _(this.runners)
            .filter((runner:RunnerEntry<any>) => {
                let matchFunction = runner.matcher.match(event.type);
                return matchFunction !== Rx.helpers.identity;
            })
            .map((runner:RunnerEntry<any>) => {
                if (runner.splitMatcher) {
                    let splitFn = runner.splitMatcher.match(event.type),
                        splitKey = splitFn(event.payload);
                    if (splitFn !== Rx.helpers.identity) {
                        let handler = _.find(runner.handlers, 'splitKey', splitKey);
                        if (!handler) {
                            handler = {
                                splitKey: splitKey,
                                runner: this.runnerFactory.create({name: "Test", definition: {}})
                            };
                            runner.handlers.push(handler);
                        }
                        return [handler];
                    }
                }
                return runner.handlers;
            })
            .flatten<{ splitKey?:string, runner:IProjectionRunner<any> }>()
            .map(handler => handler.runner)
            .valueOf();
    }

    projectionFor(area:string, projectionName:string, splitKey:string):IProjectionRunner<any> {
        return <IProjectionRunner<any>>_(this.runners)
            .filter((runner:RunnerEntry<any>) => {
                return runner.area === area && runner.viewmodelId === projectionName;
            })
            .map((runner:RunnerEntry<any>) => runner.handlers)
            .flatten<{ splitKey?:string, runner:IProjectionRunner<any> }>()
            .filter(handler => handler.splitKey === splitKey)
            .map(handler => handler.runner)
            .valueOf()[0];
    }
}

interface RunnerEntry<T> {
    area:string;
    viewmodelId:string;
    matcher:IMatcher;
    splitMatcher?:IMatcher;
    handlers:{ splitKey?:string, runner:IProjectionRunner<T>}[];
}

export default ProjectionSelector