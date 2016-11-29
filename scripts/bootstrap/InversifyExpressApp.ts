import { InversifyExpressServer } from 'inversify-express-utils';

let server = null;

export function createServer(kernel:any){
    if(!server){
        server = new InversifyExpressServer(kernel).build();
    }
}

const app = () => { return server; };

export default app