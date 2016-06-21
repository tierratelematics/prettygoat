import {IStreamFactory} from "./IStreamFactory";
import Event from "../events/Event";

interface IReadModelFactory extends IStreamFactory {
    publish(event:Event):void;
}

export default IReadModelFactory