describe("Given a set of projections to redistribute", () => {
    context("when a projection is assigned to a node", () => {
        context("and it was already running", () => {
            it("should keep it like that");
        });
        context("and it was not running", () => {
            it("should run that projection");
        });
    });
});