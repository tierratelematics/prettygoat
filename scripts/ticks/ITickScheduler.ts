import {IEventsStream} from "../streams/IEventsStream";

interface ITickScheduler extends IEventsStream {
    schedule(dueTime:number | Date, state?:string, splitKey?:string);
}

export default ITickScheduler