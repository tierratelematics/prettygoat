import IDateRetriever from "../../scripts/common/IDateRetriever";

class MockDateRetriever implements IDateRetriever {

    constructor(private date?:Date) {

    }

    getDate():Date {
        return this.date;
    }

    setDate(date:Date) {
        this.date = date;
    }

}

export default MockDateRetriever