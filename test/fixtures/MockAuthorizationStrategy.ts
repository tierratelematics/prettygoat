import IAuthorizationStrategy from "../../scripts/api/IAuthorizationStrategy";
import {Request} from 'express';
import * as Promise from 'bluebird';

class MockAuthorizationStrategy implements IAuthorizationStrategy{

    authorize(request: Request): Promise<boolean> {
        return null;
    }

}

export default MockAuthorizationStrategy;