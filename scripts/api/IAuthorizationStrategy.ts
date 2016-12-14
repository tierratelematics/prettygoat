import {Request} from 'express';

interface IAuthorizationStrategy {
    authorize(request: Request): Promise<boolean>;
}

export default IAuthorizationStrategy