import {IStreamFactory} from "./IStreamFactory";
import {Event} from "./Event";
import Dictionary from "../Dictionary";

interface IReadModelFactory extends IStreamFactory {
    asList():any[];
    publish(event:Event):void;
}

export default IReadModelFactory