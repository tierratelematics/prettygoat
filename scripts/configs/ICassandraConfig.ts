interface ICassandraConfig {
    hosts:string[];
    keyspace:string;
    fetchSize?:number;
    readDelay?:number;
}

export default ICassandraConfig