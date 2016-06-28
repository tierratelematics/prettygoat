import IStatePublisher from "./IStatePublisher";
import {Request} from "express";
import IProjectionRouter from "./IProjectionRouter";
import {inject, injectable} from "inversify";
import IProjectionSelector from "../projections/IProjectionSelector";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {Response} from "express";

@injectable()
class ExpressStatePublisher implements IStatePublisher {

    constructor(@inject("IProjectionRouter") private router:IProjectionRouter,
                @inject("IProjectionSelector") private projectionSelector:IProjectionSelector,
                @inject("IProjectionRegistry") private projectionRegistry:IProjectionRegistry) {

    }

    publish():void {
        this.router.get("/:area/:projection?/:splitKey?", (request:Request, response:Response) => {
            let entry = this.projectionRegistry.getEntry(request.params["projection"], request.params["area"]),
                handler = this.projectionSelector.projectionFor(entry.area, entry.data.name, request.params["splitKey"]);
            if (handler)
                response.json(handler.state);
            else
                response.status(404).json({error: "Projection not found"});
        });
    }

}

export default ExpressStatePublisher