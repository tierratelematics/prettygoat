import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
import {injectable} from "inversify";
const bodyParser = require("body-parser").json();

@injectable()
class BodyMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        bodyParser(request, response, next);
    }

}

export default BodyMiddleware