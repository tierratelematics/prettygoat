export interface IBackpressureConfig {
    replay: number;
    realtime: number;
}

export class BackpressureConfig implements IBackpressureConfig {
    replay = 10000;
    realtime = 100;
}
