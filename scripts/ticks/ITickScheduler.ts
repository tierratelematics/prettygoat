import {IStreamFactory} from "../streams/IStreamFactory";

interface ITickScheduler extends IStreamFactory {
    schedule(dueTime:number | Date, state?:string, splitKey?:string);
}

export default ITickScheduler