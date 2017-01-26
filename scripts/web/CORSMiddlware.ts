import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
const cors = require("cors");

class CORSMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        cors(request, response, next);
    }

}

export default CORSMiddleware