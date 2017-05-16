import {injectable, inject} from "inversify";
import IProjectionRunner from "./IProjectionRunner";
import Dictionary from "../util/Dictionary";
import IProjectionDefinition from "../registry/IProjectionDefinition";

export interface Lookup extends Dictionary<string[]> {

}

export interface ILookupService {
    keysFor<T extends IProjectionDefinition<Lookup>>(id: string, projectionName: string): Promise<string[]>;
}

@injectable()
export class LookupService implements ILookupService {

    private cache: Dictionary<Lookup> = {};

    constructor(@inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner<any>>) {

    }

    keysFor<T extends IProjectionDefinition<Lookup>>(id: string, projectionName: string): Promise<string[]> {
        this.cache[projectionName] = this.cache[projectionName] || {};
        let cachedLookup = this.cache[projectionName][id];
        if (cachedLookup)
            return Promise.resolve(cachedLookup);
        else
            return this.runners[projectionName].notifications()
                .map(notification => notification.payload[id])
                .do(value => this.cache[projectionName][id] = value)
                .toPromise<Promise<string[]>>(Promise);
    }

}