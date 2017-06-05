import ILookup from "./ILookup";
import {inject, injectable} from "inversify";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Observable} from "rx";
import LookupModel from "./LookupModel";

@injectable()
class Lookup implements ILookup {

    private projectionName: string;
    private timestamp: Date = new Date(0);

    constructor(@inject("IReadModelFactory") private readModelFactory: IReadModelFactory) {

    }

    sync(timestamp: Date): Promise<void> {
        this.timestamp = timestamp;
        return this.waitForLookup()
            .map(model => null)
            .first()
            .toPromise<Promise<void>>(Promise);
    }

    keysFor(id: string): Promise<string[]> {
        return this.waitForLookup()
            .map(model => model.lookup[id])
            .first()
            .toPromise<Promise<string[]>>(Promise);
    }

    private waitForLookup(): Observable<LookupModel> {
        return Observable.fromPromise(this.validateProjectionName())
            .flatMap(() => this.readModelFactory.from(null))
            .filter(readModel => readModel.type === this.projectionName)
            .map<LookupModel>(readModel => readModel.payload)
            .filter(lookupModel => lookupModel.timestamp >= this.timestamp);
    }

    private validateProjectionName(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.projectionName) reject(new Error("A projection name must be set"));
            else resolve();
        });
    }

    setProjectionName(name: string) {
        this.projectionName = name;
    }

}

export default Lookup