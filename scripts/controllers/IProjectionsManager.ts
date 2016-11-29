import * as express from 'express';

interface IProjectionsManager {
    stop(req: express.Request,res: express.Response):void;
    pause(req: express.Request,res: express.Response):void;
    resume(req: express.Request,res: express.Response):void;
}

export default IProjectionsManager