import {injectable} from "inversify";

export interface IEndpointConfig {
    port: number;
}

@injectable()
export class DefaultEndpointConfig implements IEndpointConfig {
    port = 3000;
}
