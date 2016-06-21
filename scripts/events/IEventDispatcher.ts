import Event from "./Event";

interface IEventDispatcher {
    dispatch(event:Event):void;
}

export default IEventDispatcher