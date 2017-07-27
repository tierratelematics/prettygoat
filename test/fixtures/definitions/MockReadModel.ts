import {IReadModel, IReadModelDefinition} from "../../../scripts/readmodels/IReadModel";
import {injectable} from "inversify";

@injectable()
export default class MockReadModel implements IReadModelDefinition<any> {

    define(): IReadModel<any> {
        return {
            name: "ReadModel",
            definition: {}
        };
    }
}
