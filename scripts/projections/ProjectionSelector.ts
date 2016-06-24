import IProjectionSelector from "./IProjectionSelector";
import IProjectionRunner from "./IProjectionRunner";
import IProjectionRunnerFactory from "./IProjectionRunnerFactory";
import Event from "../streams/Event";
import {inject, injectable} from "inversify";
import * as _ from "lodash";
import AreaRegistry from "../registry/AreaRegistry";
import RegistryEntry from "../registry/RegistryEntry";
import {IMatcher} from "../matcher/IMatcher";
import {Matcher} from "../matcher/Matcher";
import * as Rx from "rx";
import {IProjection, IWhen} from "./IProjection";

@injectable()
class ProjectionSelector implements IProjectionSelector {

    private entries:Entry<any>[] = [];

    constructor(@inject("IProjectionRunnerFactory") private runnerFactory:IProjectionRunnerFactory) {

    }

    addProjections(areaRegistry:AreaRegistry):IProjectionRunner<any>[] {
        return _.map(areaRegistry.entries, (entry:RegistryEntry<any>) => {
            let handler = this.runnerFactory.create(entry.projection.name, entry.projection.definition);
            handler.initializeWith(null);
            this.entries.push({
                handlers: [{handler: handler}],
                area: areaRegistry.area,
                projectionName: entry.name,
                matcher: new Matcher(entry.projection.definition),
                splitMatcher: entry.projection.split ? new Matcher(entry.projection.split) : null,
                projection: entry.projection
            });
            return handler;
        });
    }

    projectionsFor(event:Event):IProjectionRunner<any>[] {
        return _(this.entries)
            .filter((entry:Entry<any>) => {
                let matchFunction = entry.matcher.match(event.type);
                return matchFunction !== Rx.helpers.identity;
            })
            .map((entry:Entry<any>) => {
                if (entry.splitMatcher) {
                    let splitFn = entry.splitMatcher.match(event.type),
                        splitKey = splitFn(event.payload);
                    if (splitFn !== Rx.helpers.identity) {
                        return [this.getSplitHandler(entry, splitKey)];
                    }
                }
                return entry.handlers;
            })
            .flatten<{ splitKey?:string, handler:IProjectionRunner<any> }>()
            .map(entry => entry.handler)
            .valueOf();
    }

    private getSplitHandler(entry:Entry<any>, splitKey:string) {
        let handler = _.find(entry.handlers, ['splitKey', splitKey]);
        if (!handler) {
            handler = this.createSplitHandler(entry.projectionName, entry.projection.definition, splitKey);
            entry.handlers.push(handler);
        }
        return handler;
    }

    private createSplitHandler(projectionName:string, definition:IWhen<any>, splitKey:string) {
        let childHandler = this.runnerFactory.create(projectionName, definition),
            handler = {
                splitKey: splitKey,
                handler: childHandler
            };
        childHandler.initializeWith(null);
        return handler;
    };

    projectionFor(area:string, projectionName:string, splitKey?:string):IProjectionRunner<any> {
        return <IProjectionRunner<any>>_(this.entries)
            .filter((entry:Entry<any>) => entry.area === area && entry.projectionName === projectionName)
            .map((entry:Entry<any>) => entry.handlers)
            .flatten<{ splitKey?:string, handler:IProjectionRunner<any> }>()
            .filter(entry => entry.splitKey === splitKey)
            .map(entry => entry.handler)
            .valueOf()[0];
    }
}

interface Entry<T> {
    area:string;
    projectionName:string;
    matcher:IMatcher;
    splitMatcher?:IMatcher;
    handlers:{ splitKey?:string, handler:IProjectionRunner<T>}[];
    projection:IProjection<T>;
}

export default ProjectionSelector