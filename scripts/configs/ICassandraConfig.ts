interface ICassandraConfig {
    hosts:string[];
    keyspace:string;
    fetchSize?:number;
}

export default ICassandraConfig