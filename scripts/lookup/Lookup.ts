import ILookup from "./ILookup";
import {inject, injectable} from "inversify";
import IReadModelFactory from "../streams/IReadModelFactory";
import LookupModel from "./LookupModel";

@injectable()
class Lookup implements ILookup {

    private projectionName: string;
    private cache: LookupModel;

    constructor(@inject("IReadModelFactory") private readModelFactory: IReadModelFactory) {

    }

    keysFor(id: string): Promise<string[]> {
        if (!this.projectionName)
            return Promise.reject(new Error("A projection name must be set"));
        if (this.cache)
            return Promise.resolve(this.cache[id]);
        else
            return this.readModelFactory.from(null)
                .filter(readModel => readModel.type === this.projectionName)
                .map(readModel => readModel.payload)
                .do(value => this.cache = value)
                .map(payload => payload[id])
                .toPromise<Promise<string[]>>(Promise);

    }

    setProjectionName(name: string) {
        this.projectionName = name;
    }

}

export default Lookup