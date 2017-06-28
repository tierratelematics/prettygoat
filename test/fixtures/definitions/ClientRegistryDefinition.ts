import {IProjection, IProjectionDefinition} from "../../../scripts/projections/IProjection";
import {injectable} from "inversify";

@injectable()
class ClientRegistryDefinition implements IProjectionDefinition<number> {

    define(): IProjection<number> {
        return {
            name: "Mock",
            definition: {},
            publish: {
                "Foo": {
                    notify: {
                        TestEvent: (s, e) => null
                    }
                },
                "Bar": {
                    notify: {
                        $partition: (parameters) => parameters.id,
                        TestEvent: (s, e) => null
                    }
                }
            }
        };
    }

}

export default ClientRegistryDefinition
