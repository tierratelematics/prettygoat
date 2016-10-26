import IDateRetriever from "../../scripts/util/IDateRetriever";

class MockDateRetriever implements IDateRetriever {

    constructor(private date:Date) {

    }

    getDate():Date {
        return this.date;
    }

}

export default MockDateRetriever