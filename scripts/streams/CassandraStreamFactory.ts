import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import StreamState from "./StreamState";
import ICassandraClientFactory from "./ICassandraClientFactory";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;

    constructor(@inject("ICassandraConfig") config:ICassandraConfig,
                @inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("StreamState") private streamState:StreamState) {
        this.client = clientFactory.clientFor(config);
    }

    from(lastEvent:string):Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            this.client.stream("SELECT event,timestamp FROM messages")
                .on('readable', function () {
                    let row;
                    while (row = this.read()) {
                        let timestamp = row.timestamp.toString();
                        //if (!self.streamState.lastEvent || (timestamp > self.streamState.lastEvent)) {
                            //self.streamState.lastEvent = timestamp;
                            observer.onNext(JSON.parse(row.event.toString('utf8')));
                        //}
                    }
                })
                .on('end', () => observer.onCompleted())
                .on('error', (error) => observer.onError(error));
            return Rx.Disposable.empty;
        });
    }

}

export default CassandraStreamFactory