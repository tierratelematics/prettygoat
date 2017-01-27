import {IMiddleware, IRequest, IResponse} from "../web/IRequestComponents";
import {startsWith} from "lodash";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {inject} from "inversify";

class AuthMiddleware implements IMiddleware {

    constructor(@inject("IAuthorizationStrategy") private authStrategy: IAuthorizationStrategy) {

    }

    transform(request: IRequest, response: IResponse, next: Function) {
        if (startsWith(request.url, "/api"))
            this.authStrategy.authorize(request).then(authorized => {
                if (!authorized) {
                    response.status(401);
                    response.send({"error": "Not Authorized"});
                } else {
                    next();
                }
            });
        else {
            next();
        }
    }

}

export default AuthMiddleware