import {Snapshot, ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import {injectable, inject} from "inversify";
import {Observable} from "rx";
import Dictionary from "../Dictionary";
import * as _ from "lodash";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import ICassandraClient from "./ICassandraClient";

@injectable()
class CassandraSnapshotRepository implements ISnapshotRepository {

    constructor(@inject("ICassandraClient") private client:ICassandraClient,
                @inject("IProjectionRegistry") private registry:IProjectionRegistry) {

    }

    initialize():Rx.Observable<void> {
        return this.client.execute('create table if not exists projections_snapshots (\
            streamId text,\
            lastEvent text,\
            memento blob,\
            split text,\
            primary key ((streamId, split))\
        )');
    }

    getSnapshots():Observable<Dictionary<Snapshot<any>>> {
        return this.client.execute('select blobAsText(memento), streamid, lastEvent, split from projections_snapshots')
            .map(snapshots => _<CassandraSnapshot>(snapshots.rows)
                .groupBy(snapshot => snapshot.streamid)
                .mapValues(snapshots => {
                    if (snapshots[0].split) {
                        let memento = _(snapshots)
                            .keyBy(snapshot => snapshot.split)
                            .mapValues(snapshot => JSON.parse(snapshot["system.blobastext(memento)"] || "{}"))
                            .valueOf();
                        return new Snapshot(memento, new Date(snapshots[0].lastevent));
                    } else {
                        let snapshot = snapshots[0];
                        return new Snapshot(JSON.parse(snapshot["system.blobastext(memento)"] || "{}"), new Date(snapshot.lastevent));
                    }
                })
                .valueOf());
    }

    saveSnapshot<T>(streamId:string, snapshot:Snapshot<T>):void {
        let queries = [];
        let entry = this.registry.getEntry(streamId);
        if (entry.data.projection.split)
            queries = _.map(<Dictionary<any>>snapshot.memento, (memento, split) => "insert into projections_snapshots " +
            `(streamid, split, lastevent, memento) values ('${streamId}',` +
            `'${split}', '${snapshot.lastEvent}', textAsBlob('${JSON.stringify(memento)}'))`);
        else {
            queries = [`insert into projections_snapshots (streamid, split, lastevent, memento) values ('${streamId}',` +
            `'', '${snapshot.lastEvent}', textAsBlob('${JSON.stringify(snapshot.memento)}'))`]
        }
        _.map(queries, query => this.client.execute(query).subscribe(() => null));
    }

    deleteSnapshot(streamId:string):void {
        let entry = this.registry.getEntry(streamId),
            query = "";
        if (entry.data.projection.split)
            query = `delete from projections_snapshots where streamid = '${streamId}' and split > ''`;
        else
            query = `delete from projections_snapshots where streamid = '${streamId}' and split = ''`;
        this.client.execute(query);
    }
}

interface CassandraSnapshot {
    "system.blobastext(memento)":string;
    lastevent:string;
    split:string;
    streamid:string;
}

export default CassandraSnapshotRepository