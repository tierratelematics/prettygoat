import IDateRetriever from "./IDateRetriever";
import {injectable} from "inversify";

@injectable()
class DateRetriever implements IDateRetriever {

    getDate():Date {
        return new Date();
    }

}

export default DateRetriever