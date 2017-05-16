import ILookup from "./ILookup";
import {inject, injectable} from "inversify";
import IReadModelFactory from "../streams/IReadModelFactory";

@injectable()
class Lookup implements ILookup {

    private projectionName: string;

    constructor(@inject("IReadModelFactory") private readModelFactory: IReadModelFactory) {

    }

    keysFor(id: string): Promise<string[]> {
        if (!this.projectionName)
            return Promise.reject(new Error("A projection name must be set"));
        else
            return this.readModelFactory.from(null)
                .filter(readModel => readModel.type === this.projectionName)
                .map(readModel => readModel.payload)
                .map(payload => payload[id])
                .take(1)
                .toPromise<Promise<string[]>>(Promise);
    }

    setProjectionName(name: string) {
        this.projectionName = name;
    }

}

export default Lookup