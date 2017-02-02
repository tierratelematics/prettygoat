import {IMiddleware, IResponse, IRequest} from "./IRequestComponents";
import {injectable} from "inversify";
const bodyParser = require("body/json");

@injectable()
class BodyMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        bodyParser(request.originalRequest, response, (err, body) => {
            if (!err)
                request.body = body;
            next();
        });
    }

}

export default BodyMiddleware