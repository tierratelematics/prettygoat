import * as moment from "moment";
import {injectable, inject} from "inversify";
import IDateRetriever from "./IDateRetriever";

@injectable()
class TimePartitioner {

    constructor(@inject("IDateRetriever") private dateRetriever:IDateRetriever) {

    }

    bucketsFrom(date:Date):string[] {
        let now = moment(this.dateRetriever.getDate()),
            buckets:string[] = [];

        while (now.toDate() >= date) {
            buckets.push(moment(date).format("YYYYMMDD"));
            date = moment(date).add(1, 'days').hour(0).second(0).minute(0).toDate();
        }
        return buckets;
    }
}

export default TimePartitioner