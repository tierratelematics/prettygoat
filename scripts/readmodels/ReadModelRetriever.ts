import {inject} from "inversify";
import Dictionary from "../util/Dictionary";
import {IProjectionRunner} from "../projections/IProjectionRunner";
export interface IReadModelRetriever {
    modelFor<T>(name: string): Promise<T>;
}

export class ReadModelRetriever implements IReadModelRetriever {

    constructor(@inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner>) {

    }

    modelFor<T>(name: string): Promise<T> {
        return Promise.resolve(this.runners[name].state);
    }
}
