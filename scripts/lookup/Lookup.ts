import ILookup from "./ILookup";
import {inject, injectable} from "inversify";
import IReadModelFactory from "../streams/IReadModelFactory";

@injectable()
class Lookup implements ILookup {

    private projectionName: string;

    constructor(@inject("IReadModelFactory") private readModelFactory: IReadModelFactory) {

    }

    keysFor(id: string): Promise<string[]> {
        return undefined;
    }

    setProjectionName(name: string) {
        this.projectionName = name;
    }

}

export default Lookup