const cors = require("cors");
const bodyParser = require('body-parser');
const server = require("express")();

server.use(cors()).use(bodyParser.json());

export default server