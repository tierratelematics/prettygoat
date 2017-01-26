import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {injectable, inject, optional} from 'inversify';
import * as _ from "lodash";
import IAuthorizationConfig from "../configs/IApiKeyConfig";
import {IRequest} from "../web/IRequestComponents";

@injectable()
class AuthorizationStrategy implements IAuthorizationStrategy {

    constructor(@inject("TokenCollection") @optional() private tokenCollection: IAuthorizationConfig = []) {
    }

    authorize(request: IRequest): Promise<boolean> {
        return Promise.resolve(_.includes(this.tokenCollection, request.headers["authorization"]));
    }
}

export default AuthorizationStrategy