import ICassandraClientFactory from "../../scripts/streams/ICassandraClientFactory";
import ICassandraConfig from "../../scripts/configs/ICassandraConfig";

class MockClientFactory implements ICassandraClientFactory {
    
    clientFor(config:ICassandraConfig) {
        return null;
    }

}

export default MockClientFactory