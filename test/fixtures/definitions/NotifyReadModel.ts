import {IReadModel, IReadModelDefinition} from "../../../scripts/readmodels/IReadModel";
import {injectable} from "inversify";

@injectable()
export default class NotifyReadModel implements IReadModelDefinition<any> {

    define(): IReadModel<any> {
        return {
            name: "ReadModel",
            definition: {},
            notify: {
                
            }
        };
    }
}
