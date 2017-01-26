import {IRequestAdapter, IRouteResolver, IRequest, IResponse, IRequestTransformer} from "./IRequestComponents";
import {inject, injectable, optional} from "inversify";
import ICluster from "../cluster/ICluster";
import {eachSeries} from "async";

@injectable()
class RequestAdapter implements IRequestAdapter {

    constructor(@inject("ICluster") @optional() private cluster: ICluster,
                @inject("IRouteResolver") private routeResolver: IRouteResolver,
                @inject("IRequestTransformer") @optional() private requestTransformers: IRequestTransformer[]) {
    }

    route(request: IRequest, response: IResponse) {
        eachSeries(this.requestTransformers, (transformer, next) => {
            transformer.transform(request, response, next);
        }, () => {
            let context = this.routeResolver.resolve(
                request.url ? request.url : request.channel,
                request.url ? request.method : null
            );
            let requestHandler = context[0];
            let params = context[1];

            if (params)
                request.params = params;
            if (requestHandler) {
                let shardKey = requestHandler.keyFor(request),
                    originalRequest = request.originalRequest,
                    originalResponse = response.originalResponse;
                if (!this.cluster || (this.cluster && this.cluster.handleOrProxy(shardKey, originalRequest, originalResponse))) {
                    requestHandler.handle(request, response);
                }
            } else {
                response.status(404);
                response.send();
            }
        });

    }

}

export default RequestAdapter