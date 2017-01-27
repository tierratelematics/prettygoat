import IAuthorizationStrategy from "../../scripts/api/IAuthorizationStrategy";
import {IRequest} from "../../scripts/web/IRequestComponents";

class MockAuthorizationStrategy implements IAuthorizationStrategy {

    authorize(request: IRequest): Promise<boolean> {
        return null;
    }

}

export default MockAuthorizationStrategy;