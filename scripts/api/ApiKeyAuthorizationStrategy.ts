import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {injectable, inject, optional} from 'inversify';
import * as _ from "lodash";
import * as Promise from "bluebird";
import {Request} from 'express';
import IApiKeyConfig from "../configs/IApiKeyConfig";

@injectable()
class ApiKeyAuthorizationStrategy implements IAuthorizationStrategy {
    constructor(@inject("IApiKeyConfig") @optional() private config: IApiKeyConfig = []) {
    }

    authorize(request: Request): Promise<boolean> {
        return Promise.resolve(_.includes(this.config, request.header("Authorization")));
    }
}

export default ApiKeyAuthorizationStrategy