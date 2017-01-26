import {IMiddleware, IRequest, IResponse} from "../web/IRequestComponents";
import {startsWith} from "lodash";

class AuthMiddleware implements IMiddleware {

    transform(request: IRequest, response: IResponse, next: Function) {
        if (startsWith(request.url, "/api"))
            authStrategy.authorize(request).then(authorized => {
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