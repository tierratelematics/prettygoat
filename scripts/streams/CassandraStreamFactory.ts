import {IStreamFactory} from "./IStreamFactory";
import {injectable, inject} from "inversify";
import ICassandraConfig from "../configs/ICassandraConfig";
import * as Rx from "rx";
import StreamState from "./StreamState";
import ICassandraClientFactory from "./ICassandraClientFactory";

@injectable()
class CassandraStreamFactory implements IStreamFactory {

    private client:any;

    constructor(@inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") config:ICassandraConfig,
                @inject("StreamState") private streamState:StreamState) {
        this.client = clientFactory.clientFor(config);
    }

    from(lastEvent:string):Rx.Observable<any> {
        return this.streamSource()
            .where((event, index, obs) => !this.streamState.lastEvent || (event.timestamp > this.streamState.lastEvent))
            .do(event => this.streamState.lastEvent = event.timestamp)
            .map(event => event.event);
    }

    streamSource():Rx.Observable<any> {
        return Rx.Observable.create(observer => {
            this.client.stream("SELECT event,timestamp FROM messages")
                .on('readable', function () {
                    let row;
                    while (row = this.read()) {
                        observer.onNext({
                            timestamp: row.timestamp.toString(),
                            event: JSON.parse(row.event.toString('utf8'))
                        });
                    }
                })
                .on('end', () => observer.onCompleted())
                .on('error', (error) => observer.onError(error));
            return Rx.Disposable.empty;
        });
    }

}

export default CassandraStreamFactory