import {IStreamFactory} from "../streams/IStreamFactory";

interface ITickScheduler extends IStreamFactory {
    schedule(dueTime: number | Date, state?: string);
}

export default ITickScheduler
