import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
import {injectable} from "inversify";
const bodyParser = require("body-parser");

@injectable()
class BodyMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        bodyParser.json(request, response, next);
    }

}

export default BodyMiddleware