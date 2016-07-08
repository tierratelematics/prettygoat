import {Snapshot, ISnapshotRepository} from "./ISnapshotRepository";
import {injectable, inject} from "inversify";
import {Observable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import ICassandraClientFactory from "../streams/ICassandraClientFactory";
import Dictionary from "../Dictionary";
import * as _ from "lodash";

@injectable()
class CassandraSnapshotRepository implements ISnapshotRepository {
    private execute:any;

    constructor(@inject("ICassandraClientFactory") clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") config:ICassandraConfig) {
        let client = clientFactory.clientFor(config);
        this.execute = Observable.fromNodeCallback(client.execute, client);
    }

    initialize():Rx.Observable<void> {
        return this.execute('create table if not exists projections_snapshots (\
            streamId text,\
            lastEvent text,\
            memento blob,\
            split text,\
            primary key ((streamId, split), lastEvent)\
        )');
    }

    getSnapshots():Observable<Dictionary<Snapshot<any>>> {
        return this.execute('select blobAsText(memento), streamid, lastEvent,split from projections_snapshots')
            .map(snapshots => {
                return _<CassandraSnapshot>(snapshots.rows)
                    .keyBy(snapshot=> {
                        let key = snapshot.streamid;
                        if (snapshot.split) key += `:${snapshot.split}`;
                        return key

                    })
                    .mapValues((snapshot:CassandraSnapshot) => new Snapshot<any>(
                        JSON.parse(snapshot["system.blobastext(memento)"] || "{}"),
                        snapshot.lastevent)
                    )
                    .valueOf();
            });
    }

    getSnapshot<T>(streamId:string):Observable<Snapshot<T>> {
        return this.getSnapshots().map(snapshots => snapshots[streamId]);
    }

    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void {
        let split = snapshot.splitKey || "";
        this.execute(`delete from projections_snapshots where streamid='${streamId}' and split='${split}'`)
            .flatMap(() => this.execute(`insert into projections_snapshots (streamid, split, lastevent, memento) values ('${streamId}',
                '${split}', '${snapshot.lastEvent}', textAsBlob('${JSON.stringify(snapshot.memento)}'))`))
            .subscribe(() => {

            });
    }
}

interface CassandraSnapshot {
    "system.blobastext(memento)":string;
    lastevent:string;
    split:string;
    streamid:string;
}

export default CassandraSnapshotRepository