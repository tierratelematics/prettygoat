import {SplitKey} from "../projections/IProjection";

export interface Event {
    type: string;
    payload: any;
    timestamp: Date;
    splitKey: SplitKey;
}