import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {injectable, inject, optional} from 'inversify';
import * as _ from "lodash";
import IApiKeyConfig from "../configs/IApiKeyConfig";
import {IRequest} from "../web/IRequestComponents";

@injectable()
class ApiKeyAuthorizationStrategy implements IAuthorizationStrategy {
    constructor(@inject("IApiKeyConfig") @optional() private config: IApiKeyConfig = []) {
    }

    authorize(request: IRequest): Promise<boolean> {
        return Promise.resolve(_.includes(this.config, request.headers["authorization"]));
    }
}

export default ApiKeyAuthorizationStrategy