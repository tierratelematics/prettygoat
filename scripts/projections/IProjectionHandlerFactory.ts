import IProjectionHandler from "./IProjectionHandler";
import {IProjection, IWhen} from "./IProjection";

interface IProjectionHandlerFactory {
    create<T>(projectionName:string, definition:IWhen<T>, splitKey?:string):IProjectionHandler<T>;
}

export default IProjectionHandlerFactory