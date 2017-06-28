import {IRequest, IRequestHandler, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {inject} from "inversify";
import {reduce, map, flatten} from "lodash";
import AreaRegistry from "../registry/AreaRegistry";

@Route("GET", "/api/projections/list")
export class ProjectionsListHandler implements IRequestHandler {

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {

    }

    handle(request: IRequest, response: IResponse) {
        let projections = flatten(reduce<AreaRegistry, string[][]>(this.registry.getAreas(), (result, area) => {
            result.push(map(area.entries, entry => entry.name));
            return result;
        }, []));
        response.send(projections);
    }

    keyFor(request: IRequest): string {
        return null;
    }
}
