import {IRequest} from "../web/IRequestComponents";

interface IAuthorizationStrategy {
    authorize(request: IRequest): Promise<boolean>;
}

export default IAuthorizationStrategy
