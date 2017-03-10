import {ClientOptions} from "cassandra-driver";

interface ICassandraConfig {
    hosts: string[];
    keyspace: string;
    username?: string;
    password?: string;
    fetchSize?: number;
    readDelay?: number;
    driverOptions?: ClientOptions;
}

export default ICassandraConfig