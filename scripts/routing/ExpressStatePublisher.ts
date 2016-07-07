import IStatePublisher from "./IStatePublisher";
import {Request} from "express";
import IProjectionRouter from "./IProjectionRouter";
import {inject, injectable} from "inversify";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import {Response} from "express";

@injectable()
class ExpressStatePublisher implements IStatePublisher {

    constructor(@inject("IProjectionRouter") private router:IProjectionRouter,
                @inject("IProjectionRegistry") private projectionRegistry:IProjectionRegistry) {

    }

    publish():void {
       /* this.router.get("/:area/:projection?/:splitKey?", (request:Request, response:Response) => {
            let area = request.params["area"],
                projection = request.params["projection"];
            if (!area || !projection) return this.send404(response);
            let entry = this.projectionRegistry.getEntry(projection, area);
            if (!entry.data) return this.send404(response);
            let handler = this.projectionSelector.projectionFor(entry.area, entry.data.name, request.params["splitKey"]);
            if (handler)
                response.json(handler.state);
            else
                this.send404(response);
        });*/
    }

    private send404(response:Response) {
        response.status(404).json({error: "Projection not found"});
    }

}

export default ExpressStatePublisher