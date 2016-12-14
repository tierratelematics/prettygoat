import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {injectable, inject} from 'inversify';
import * as _ from "lodash";
import * as Promise from "bluebird";

@injectable()
class AuthorizationStrategy implements IAuthorizationStrategy {

    constructor(@inject("TokenCollection") private tokenCollection: string[]) {
    }

    authorize(token: string): Promise<boolean> {
        return Promise.resolve(_.includes(this.tokenCollection,token));
    }
}

export default AuthorizationStrategy;