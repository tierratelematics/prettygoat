import IAuthorizationStrategy from "./IAuthorizationStrategy";
import {injectable, inject} from 'inversify';
import * as _ from "lodash";

@injectable()
class AuthorizationStrategy implements IAuthorizationStrategy {

    constructor(@inject("TokenCollection") private tokenCollection: string[]) {
    }

    authorize(token: string): boolean {
        return _.includes(this.tokenCollection, token);
    }
}

export default AuthorizationStrategy;