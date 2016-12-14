import {InversifyExpressServer} from 'inversify-express-utils';
import IAuthorizationStrategy from "../api/IAuthorizationStrategy";
import {Request, Response, NextFunction} from 'express';


const cors = require("cors");
const bodyParser = require('body-parser');

export let app = null;
export let server = null;

export function createServer(kernel: inversify.interfaces.Kernel) {
    if (!app) {
        app = new InversifyExpressServer(kernel)
            .setConfig((app) => {
                app.use(bodyParser.urlencoded({extended: true}))
                    .use(bodyParser.json())
                    .use(cors())
                    .use('/api', (request: Request, response: Response, next: NextFunction) => {
                        kernel.get<IAuthorizationStrategy>("IAuthorizationStrategy").authorize(request).then((authorized: boolean) => {
                            if (!authorized)
                                response.status(405).json({"error": "Not Authorized"});
                            else
                                next();
                        });
                    })
            })
            .build();
    }

    return app;
}

export function setIstanceServer(serverIstance: any) {
    if (!server) {
        server = serverIstance;
    }
}
