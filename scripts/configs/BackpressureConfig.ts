export interface IBackpressureConfig {
    replay: number;
    realtime: number;
}

export class BackpressureConfig implements IBackpressureConfig {
    replay = 2000;
    realtime = 100;
}
