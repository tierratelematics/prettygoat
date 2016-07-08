import IProjectionRunner from "../projections/IProjectionRunner";
import PushContext from "./PushContext";

interface IPushNotifier {
    notify(context:PushContext, clientId?:string, splitKey?:string):void;
}

export default IPushNotifier