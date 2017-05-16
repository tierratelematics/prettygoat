import ILookup from "./ILookup";
import {inject, injectable} from "inversify";

@injectable()
class Lookup implements ILookup {

    private projectionName: string;

    keysFor(id: string): Promise<string[]> {
        return undefined;
    }

    setProjectionName(name: string) {
        this.projectionName = name;
    }

}

export default Lookup