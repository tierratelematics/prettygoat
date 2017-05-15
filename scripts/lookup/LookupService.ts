import {injectable, inject} from "inversify";
import IProjectionRunner from "../projections/IProjectionRunner";
import Dictionary from "../util/Dictionary";

export interface ILookupService {
    keysFor(id: string, projectionName: string): Promise<string[]>;
}

@injectable()
export class LookupService implements ILookupService {

    constructor(@inject("IProjectionRunnerHolder") private runners: Dictionary<IProjectionRunner<any>>) {

    }

    keysFor(id: string, projectionName: string): Promise<string[]> {
        return this.runners[projectionName].notifications().map(notification => notification.payload[id]).toPromise<Promise<string[]>>(Promise);
    }

}