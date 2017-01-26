import {IRequestTransformer, IResponse, IRequest} from "./IRequestComponents";
const cors = require("cors");

class CORSRequestTransformer implements IRequestTransformer {

    transform(request: IRequest, response: IResponse, next: Function) {
        cors(request, response, next);
    }

}

export default CORSRequestTransformer