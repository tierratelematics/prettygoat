interface ICassandraConfig {
    hosts:string[];
    keyspace:string;
    readTimeout?: number;
}

export default ICassandraConfig