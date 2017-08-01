export interface ISocketConfig {
    path: string;
}

export class DefaultSocketConfig implements ISocketConfig {
    path = "/notifications";
}
