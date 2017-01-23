const cors = require("cors");
const bodyParser = require('body-parser');
const app = require("express")();
const server = require('http').Server(app);

app.use(cors()).use(bodyParser.json());

export {app}
export {server}