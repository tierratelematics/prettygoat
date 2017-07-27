import {IRequestHandler, IRequest, IResponse} from "./IRequestComponents";
import Route from "./RouteDecorator";

@Route("/health", "GET")
class HealthCheckHandler implements IRequestHandler {

    handle(request: IRequest, response: IResponse) {
        response.end();
    }

    keyFor(request: IRequest): string {
        return null;
    }

}

export default HealthCheckHandler
