import {injectable, inject} from "inversify";
import IProjectionRunner from "../projections/IProjectionRunner";
import Dictionary from "../util/Dictionary";
import Lookup from "./Lookup";

export interface ILookupService {
    keysFor(id: string, projectionName: string): Promise<string[]>;
}

@injectable()
export class LookupService implements ILookupService {

    private cache: Dictionary<Dictionary<Lookup>> = {};

    constructor(@inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner<any>>) {

    }

    keysFor(id: string, projectionName: string): Promise<string[]> {
        this.cache[projectionName] = this.cache[projectionName] || {};
        let cached = this.cache[projectionName][id];
        if (cached)
            return Promise.resolve(cached);
        else
            return this.runners[projectionName].notifications()
                .map(notification => notification.payload[id])
                .do(value => this.cache[projectionName][id] = value)
                .toPromise<Promise<string[]>>(Promise);
    }

}