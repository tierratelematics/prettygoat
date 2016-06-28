import IProjectionHandlerFactory from "./IProjectionHandlerFactory";
import IProjectionHandler from "./IProjectionHandler";
import {ProjectionHandler} from "./ProjectionHandler";
import {injectable, inject} from "inversify";
import {IWhen} from "./IProjection";
import {Matcher} from "../matcher/Matcher";
import IReadModelFactory from "../streams/IReadModelFactory";

@injectable()
class ProjectionHandlerFactory implements IProjectionHandlerFactory {

    constructor(@inject("IReadModelFactory") private readModelFactory:IReadModelFactory) {

    }

    create<T>(projectionName:string, definition:IWhen<T>, splitKey?:string):IProjectionHandler<T> {
        return new ProjectionHandler<T>(projectionName, new Matcher(definition), this.readModelFactory, splitKey);
    }
}

export default ProjectionHandlerFactory