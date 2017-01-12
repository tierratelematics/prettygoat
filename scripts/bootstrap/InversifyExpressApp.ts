import { InversifyExpressServer } from 'inversify-express-utils';
import {interfaces} from "inversify";
import IAuthorizationStrategy from "../api/IAuthorizationStrategy";
import {Request, Response, NextFunction} from 'express';


const cors = require("cors");
const bodyParser = require('body-parser');

export let app = null;
export let server = null;

export function createServer(container:interfaces.Container) {
    if(!app) {
        app = new InversifyExpressServer(container)
            .setConfig((app) => {
                app.use(bodyParser.urlencoded({extended: true}))
                    .use(bodyParser.json())
                    .use(cors())
                    .use('/api', (request: Request, response: Response, next: NextFunction) => {
                        container.get<IAuthorizationStrategy>("IAuthorizationStrategy").authorize(request).then((authorized: boolean) => {
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
