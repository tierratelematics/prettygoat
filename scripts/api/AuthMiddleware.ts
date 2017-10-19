import {IMiddleware, IRequest, IResponse} from "../web/IRequestComponents";
import {startsWith} from "lodash";
import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {inject, injectable} from "inversify";
import {ILogger, NullLogger, LoggingContext} from "inversify-logging";

@injectable()
@LoggingContext("AuthMiddleware")
class AuthMiddleware implements IMiddleware {

    @inject("ILogger") private logger: ILogger = NullLogger;

    constructor(@inject("IAuthorizationStrategy") private authStrategy: IAuthorizationStrategy) {

    }

    transform(request: IRequest, response: IResponse, next: Function) {
        if (startsWith(request.url, "/api")) {
            this.authStrategy.authorize(request).then(authorized => {
                if (!authorized) {
                    this.logger.warning(`An API request has not been authorized: ${JSON.stringify(request)}`);
                    response.status(401);
                    response.send({"error": "Not Authorized"});
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    }

}

export default AuthMiddleware
