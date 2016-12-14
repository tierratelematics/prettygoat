import IAuthorizationStrategy from "../../scripts/api/IAuthorizationStrategy";

class MockAuthorizationStrategy implements IAuthorizationStrategy{

    authorize(token: string): boolean {
        return null;
    }
}

export default MockAuthorizationStrategy;