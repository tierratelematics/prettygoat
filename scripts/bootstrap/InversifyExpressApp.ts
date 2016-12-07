import { InversifyExpressServer } from 'inversify-express-utils';

const cors = require("cors");
const bodyParser = require('body-parser');

export let app = null;
export let server = null;

export function createServer(kernel:any) {
    if(!app) {
        app = new InversifyExpressServer(kernel)
            .setConfig((app) => {
                app.use(bodyParser.urlencoded({extended: true}))
                   .use(bodyParser.json())
                   .use(cors());
            })
            .build();
    }

    return app;
}

export function setIstanceServer(serverIstance:any){
    if(!server) {
        server = serverIstance;
    }
}
