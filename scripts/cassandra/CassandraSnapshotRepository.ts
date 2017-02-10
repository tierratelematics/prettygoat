import {Snapshot, ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import {injectable, inject} from "inversify";
import {Observable} from "rx";
import Dictionary from "../util/Dictionary";
import * as _ from "lodash";
import IProjectionRegistry from "../registry/IProjectionRegistry";
import ICassandraClient from "./ICassandraClient";

@injectable()
class CassandraSnapshotRepository implements ISnapshotRepository {

    constructor(@inject("ICassandraClient") private client: ICassandraClient,
                @inject("IProjectionRegistry") private registry: IProjectionRegistry) {

    }

    initialize(): Observable<void> {
        return this.client.execute('create table if not exists projections_snapshots (\
            streamId text,\
            lastEvent text,\
            memento blob,\
            split text,\
            primary key ((streamId), split)\
        )');
    }

    getSnapshots(): Observable<Dictionary<Snapshot<any>>> {
        return this.client.execute('select blobAsText(memento) as memento, streamid, lastEvent, split from projections_snapshots')
            .map(snapshots => _<CassandraSnapshot>(snapshots.rows)
                .groupBy(snapshot => snapshot.streamid)
                .mapValues(snapshots => {
                    if (snapshots[0].split) {
                        let memento = _(snapshots)
                            .keyBy(snapshot => snapshot.split)
                            .mapValues((snapshot: CassandraSnapshot) => JSON.parse(this.replaceQuotes(snapshot.memento)))
                            .valueOf();
                        return new Snapshot(memento, new Date(snapshots[0].lastevent));
                    } else {
                        let snapshot = snapshots[0];
                        return new Snapshot(JSON.parse(this.replaceQuotes(snapshot.memento)), new Date(snapshot.lastevent));
                    }
                })
                .valueOf());
    }

    getSnapshot<T>(streamId: string): Observable<Snapshot<T>> {
        return this.getSnapshots().map(snapshots => snapshots[streamId]);
    }

    private replaceQuotes(text: string): string {
        if (!_.isString(text)) return text;
        return text && text !== 'undefined' ? text.replace(/''/g, "'") : null;
    }

    saveSnapshot<T>(streamId: string, snapshot: Snapshot<T>): Observable<void> {
        return this.deleteSnapshot(streamId)
            .flatMap(() => {
                let queries = [];
                let entry = this.registry.getEntry(streamId);
                if (entry.data.projection.split) {
                    queries = _.map(<Dictionary<any>>snapshot.memento, (memento, split) => "insert into projections_snapshots " +
                    `(streamid, split, lastevent, memento) values ('${streamId}',` +
                    `'${split}', '${snapshot.lastEvent}', textAsBlob('${this.escapeQuotes(JSON.stringify(memento))}'))`);
                } else {
                    queries = [`insert into projections_snapshots (streamid, split, lastevent, memento) values ('${streamId}',` +
                    `'', '${snapshot.lastEvent}', textAsBlob('${this.escapeQuotes(JSON.stringify(snapshot.memento))}'))`];
                }
                return Observable.from(queries);
            })
            .flatMap(query => this.client.execute(query))
            .takeLast(1);
    }

    private escapeQuotes(text: string): string {
        return text ? text.replace(/'/g, "''") : null;
    }

    deleteSnapshot(streamId: string): Observable<void> {
        return this.client.execute(`delete from projections_snapshots where streamid = '${streamId}'`);
    }
}

interface CassandraSnapshot {
    memento: string;
    lastevent: string;
    split: string;
    streamid: string;
}

export default CassandraSnapshotRepository