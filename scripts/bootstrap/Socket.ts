import ExpressApp from "./ExpressApp";
export let server = require('http').Server(ExpressApp);
export let socket = require('socket.io')(server);