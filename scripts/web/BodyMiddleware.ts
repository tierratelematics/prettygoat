import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
const bodyParser = require("body-parser/json");

class BodyMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        bodyParser(request, response, next);
    }

}

export default BodyMiddleware