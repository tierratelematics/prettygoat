import {IStreamFactory} from "./IStreamFactory";
import Event from "./Event";

interface IReadModelFactory extends IStreamFactory {
    publish(event:Event<any>):void;
}

export default IReadModelFactory