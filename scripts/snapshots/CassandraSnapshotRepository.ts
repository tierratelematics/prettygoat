import {Snapshot, ISnapshotRepository} from "./ISnapshotRepository";
import {injectable, inject} from "inversify";
import {Observable} from "rx";
import ICassandraConfig from "../configs/ICassandraConfig";
import ICassandraClientFactory from "../streams/ICassandraClientFactory";
import Dictionary from "../Dictionary";
import * as _ from "lodash";
import IProjectionRegistry from "../registry/IProjectionRegistry";

@injectable()
class CassandraSnapshotRepository implements ISnapshotRepository {
    private execute:any;
    private batch:any;

    constructor(@inject("ICassandraClientFactory") private clientFactory:ICassandraClientFactory,
                @inject("ICassandraConfig") private config:ICassandraConfig,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry) {
    }

    private setupClient() {
        if (!this.execute) {
            let client = this.clientFactory.clientFor(this.config);
            this.execute = Observable.fromNodeCallback(client.execute, client);
            this.batch = Observable.fromNodeCallback(client.batch, client);
        }
    }

    initialize():Rx.Observable<void> {
        this.setupClient();
        return this.execute('create table if not exists projections_snapshots (\
            streamId text,\
            lastEvent text,\
            memento blob,\
            split text,\
            primary key ((streamId, split))\
        )');
    }

    getSnapshots():Observable<Dictionary<Snapshot<any>>> {
        this.setupClient();
        return this.execute('select blobAsText(memento), streamid, lastEvent, split from projections_snapshots')
            .map(snapshots => _<CassandraSnapshot>(snapshots.rows)
                .groupBy(snapshot => snapshot.streamid)
                .mapValues(snapshots => {
                    if (snapshots[0].split) {
                        let memento = _(snapshots)
                            .keyBy(snapshot => snapshot.split)
                            .mapValues(snapshot => JSON.parse(snapshot["system.blobastext(memento)"] || "{}"))
                            .valueOf();
                        return new Snapshot(memento, snapshots[0].lastevent);
                    } else {
                        let snapshot = snapshots[0];
                        return new Snapshot(JSON.parse(snapshot["system.blobastext(memento)"] || "{}"), snapshot.lastevent);
                    }
                })
                .valueOf());
    }

    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void {
        this.setupClient();
        let queries = [];
        let entry = this.registry.getEntry(streamId);
        if (entry.data.projection.split)
            queries = _.map(<Dictionary<any>>snapshot.memento, (memento, split) => `insert into projections_snapshots\
                        (streamid, split, lastevent, memento) values ('${streamId}',
                        '${split}', '${snapshot.lastEvent}', textAsBlob('${JSON.stringify(memento)}'))`);
        else {
            queries = [`insert into projections_snapshots (streamid, split, lastevent, memento) values ('${streamId}',
                                '', '${snapshot.lastEvent}', textAsBlob('${JSON.stringify(snapshot.memento)}'))`]
        }
        this.batch(_.map(queries, query => {
            return {query: query};
        })).subscribe(() => null);
    }
}

interface CassandraSnapshot {
    "system.blobastext(memento)":string;
    lastevent:string;
    split:string;
    streamid:string;
}

export default CassandraSnapshotRepository