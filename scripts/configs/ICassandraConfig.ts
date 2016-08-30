interface ICassandraConfig {
    hosts:string[];
    keyspace:string;
    readTimeout?: number;
    fetchSize?:number;
}

export default ICassandraConfig