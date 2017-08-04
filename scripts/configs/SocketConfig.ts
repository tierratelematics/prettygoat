import {injectable} from "inversify";

export interface ISocketConfig {
    path: string;
}

@injectable()
export class DefaultSocketConfig implements ISocketConfig {
    path = "/notifications";
}
