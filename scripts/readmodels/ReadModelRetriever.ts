import {inject, injectable} from "inversify";
import Dictionary from "../common/Dictionary";
import {IProjectionRunner} from "../projections/IProjectionRunner";

export interface IReadModelRetriever {
    modelFor<T>(name: string): Promise<T>;
}

@injectable()
export class ReadModelRetriever implements IReadModelRetriever {

    constructor(@inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner>) {

    }

    modelFor<T>(name: string): Promise<T> {
        return Promise.resolve(this.runners[name].state);
    }
}
