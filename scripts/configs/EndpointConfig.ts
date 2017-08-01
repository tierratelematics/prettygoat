export interface IEndpointConfig {
    port: number;
}

export class DefaultEndpointConfig implements IEndpointConfig {
    port = 3000;
}
