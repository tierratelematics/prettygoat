import {Request} from 'express';
import * as Promise from 'bluebird';

interface IAuthorizationStrategy {
    authorize(request: Request): Promise<boolean>;
}

export default IAuthorizationStrategy