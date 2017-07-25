import {IRequest, IRequestHandler, IResponse} from "../web/IRequestComponents";
import Route from "../web/RouteDecorator";
import {inject} from "inversify";
import {map} from "lodash";
import {IProjectionRegistry} from "../bootstrap/ProjectionRegistry";

@Route("/api/projections/list", "GET")
export class ProjectionsListHandler implements IRequestHandler {

    constructor(@inject("IProjectionRegistry") private registry: IProjectionRegistry) {

    }

    handle(request: IRequest, response: IResponse) {
        response.send(map(this.registry.projections(), entry => entry[1].name));
    }

    keyFor(request: IRequest): string {
        return null;
    }
}
