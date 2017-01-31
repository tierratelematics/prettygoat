export interface IPollToPushConfig {
    interval: number
}

export class DefaultPollToPushConfig implements IPollToPushConfig {
    interval = 10000
}