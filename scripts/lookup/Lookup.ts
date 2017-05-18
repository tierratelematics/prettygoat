import ILookup from "./ILookup";
import {inject, injectable} from "inversify";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Observable} from "rx";

@injectable()
class Lookup implements ILookup {

    private projectionName: string;

    constructor(@inject("IReadModelFactory") private readModelFactory: IReadModelFactory,
                @inject("RealtimeNotifier") private realtimeNotifier: Observable<string>) {

    }

    keysFor(id: string): Promise<string[]> {
        if (!this.projectionName)
            return Promise.reject(new Error("A projection name must be set"));
        else
            return this.realtimeNotifier
                .filter(projection => projection === this.projectionName)
                .flatMap(() => this.readModelFactory.from(null))
                .filter(readModel => readModel.type === this.projectionName)
                .map(readModel => readModel.payload[id])
                .first()
                .toPromise<Promise<string[]>>(Promise);
    }

    setProjectionName(name: string) {
        this.projectionName = name;
    }

}

export default Lookup