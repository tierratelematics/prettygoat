import ICassandraConfig from "../configs/ICassandraConfig";

interface ICassandraClientFactory {
    clientFor(config:ICassandraConfig);
}

export default ICassandraClientFactory