import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
const bodyParser = require("body-parser");

class BodyMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        bodyParser.json(request, response, next);
    }

}

export default BodyMiddleware