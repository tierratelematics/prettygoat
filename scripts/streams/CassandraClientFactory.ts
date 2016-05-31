import ICassandraClientFactory from "./ICassandraClientFactory";
import ICassandraConfig from "../configs/ICassandraConfig";
const cassandra = require('cassandra-driver');
import {injectable} from "inversify";

@injectable()
class CassandraClientFactory implements ICassandraClientFactory {

    clientFor(config:ICassandraConfig) {
        return new cassandra.Client({contactPoints: config.hosts, keyspace: config.keyspace});
    }

}

export default CassandraClientFactory