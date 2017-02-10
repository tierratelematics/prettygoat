import {IMiddlewareTransformer, IMiddleware, IRequest, IResponse, RequestData} from "./IRequestComponents";
import {eachSeries} from "async";
import {multiInject, optional, injectable} from "inversify";

@injectable()
class MiddlewareTransformer implements IMiddlewareTransformer {

    constructor(@multiInject("IMiddleware") @optional() private middlewares: IMiddleware[]) {

    }

    transform(request: IRequest, response: IResponse): Promise<RequestData> {
        return new Promise((resolve, reject) => {
            eachSeries(this.middlewares, (middleware, next) => {
                middleware.transform(request, response, next);
            }, (error) => {
                if (error) reject(error);
                else resolve([request, response]);
            });
        });
    }

}

export default MiddlewareTransformer