import IDateRetriever from "../../scripts/util/IDateRetriever";

class MockDateRetriever implements IDateRetriever {

    constructor(private date:Date) {

    }

    getDate():string {
        return this.date.toISOString();
    }

}

export default MockDateRetriever