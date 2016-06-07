import * as moment from "moment";

class TimePartitioner {

    bucketsFrom(date:Date):string[] {
        let now = moment(),
            buckets:string[] = [];

        while (now.toDate() >= date) {
            buckets.push("'" + moment(date).format("YYYYMMDD") + "'");
            date = moment(date).add(1, 'days').toDate();
        }
        return buckets;
    }
}

export default TimePartitioner