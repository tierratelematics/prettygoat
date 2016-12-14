interface IAuthorizationStrategy {
    authorize(token: string): Promise<boolean>;
}

export default IAuthorizationStrategy