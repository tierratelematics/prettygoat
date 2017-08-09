import {injectable} from "inversify";

export interface INotificationConfig {
    protocol: string;
    host: string;
    port?: number;
    path?: string;
}

@injectable()
export class DefaultNotificationConfig implements INotificationConfig {
    protocol = "http";
    host = "localhost";
}
