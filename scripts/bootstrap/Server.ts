import InversifyExpressApp from "./InversifyExpressApp";

export let server = null;

export function inizializeServer(){
    if(!server){
        server = require('http').Server(InversifyExpressApp());
    }
}