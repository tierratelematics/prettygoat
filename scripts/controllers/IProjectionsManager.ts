import * as express from 'express';
import Dictionary from "../Dictionary";

interface IProjectionsManager {
    status:number;
    response:Dictionary<any>;
    stop(req: express.Request,res: express.Response):void;
    pause(req: express.Request,res: express.Response):void;
    resume(req: express.Request,res: express.Response):void;
}

export default IProjectionsManager