interface ICassandraConfig {
    hosts: string[];
    keyspace: string;
    username?: string;
    password?: string;
    fetchSize?: number;
    readDelay?: number;
}

export default ICassandraConfig