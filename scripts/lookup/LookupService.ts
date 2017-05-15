import {injectable} from "inversify";

export interface ILookupService {
    keysFor(id: string, projectionName: string): Promise<string[]>;
}

@injectable()
export class LookupService implements ILookupService {

    constructor() {

    }

    keysFor(id: string, projectionName: string): Promise<string[]> {
        return undefined;
    }

}