import {IRequestTransformer, IResponse, IRequest} from "./IRequestComponents";
const bodyParser = require("body-parser/json");

class BodyRequestTransformer implements IRequestTransformer {

    transform(request: IRequest, response: IResponse, next: Function) {
        bodyParser(request, response, next);
    }

}

export default BodyRequestTransformer