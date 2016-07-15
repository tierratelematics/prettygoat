import ICassandraClientFactory from "./ICassandraClientFactory";
import ICassandraConfig from "../configs/ICassandraConfig";
const cassandra = require('cassandra-driver');
import {injectable} from "inversify";

@injectable()
class CassandraClientFactory implements ICassandraClientFactory {

    private client = null;

    clientFor(config:ICassandraConfig) {
        if (!this.client)
            this.client = new cassandra.Client({contactPoints: config.hosts, keyspace: config.keyspace});
        return this.client;
    }

}

export default CassandraClientFactory