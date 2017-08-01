export interface INotificationConfig {
    protocol: string;
    host: string;
    port?: number;
    path?: string;
}

export class DefaultNotificationConfig implements INotificationConfig {
    protocol = "http";
    host = "localhost";
}
