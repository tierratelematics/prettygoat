import * as moment from "moment";
import {injectable, inject} from "inversify";
import IDateRetriever from "../util/IDateRetriever";

@injectable()
class TimePartitioner {

    constructor(@inject("IDateRetriever") private dateRetriever:IDateRetriever) {

    }

    bucketsFrom(date:Date):string[] {
        let buckets:string[] = [];

        while (this.dateRetriever.getDate() >= date) {
            buckets.push(moment(date).format("YYYYMMDD"));
            date = moment(date).add(1, 'days').hour(0).second(0).minute(0).toDate();
        }
        return buckets;
    }
}

export default TimePartitioner