import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {injectable, inject} from 'inversify';
import * as _ from "lodash";
import * as Promise from "bluebird";
import {Request} from 'express';
import IAuthorizationConfig from "../configs/IAuthorizationConfig";

@injectable()
class AuthorizationStrategy implements IAuthorizationStrategy {
    constructor(@inject("TokenCollection") private tokenCollection: IAuthorizationConfig) {
    }

    authorize(request: Request): Promise<boolean> {
        return Promise.resolve(_.includes(this.tokenCollection,request.header("apiKey")));
    }
}

export default AuthorizationStrategy;