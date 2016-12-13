interface IAuthorizationStrategy {
    authorize(token: string): boolean;
}

export default IAuthorizationStrategy