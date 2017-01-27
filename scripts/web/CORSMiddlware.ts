import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
import {injectable} from "inversify";
const cors = require("cors");

@injectable()
class CORSMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        cors(request, response, next);
    }

}

export default CORSMiddleware