import { InversifyExpressServer } from 'inversify-express-utils';

const cors = require("cors");
export let app = null;

export function createServer(kernel:any) {
    if(!app) {
        app = new InversifyExpressServer(kernel).build().use(cors());
    }
    return app;
}

