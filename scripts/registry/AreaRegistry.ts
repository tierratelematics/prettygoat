import {IProjection} from "../projections/IProjection";

class AreaRegistry {
    constructor(public area: string, public entries: IProjection<any>[]) {
    }
}

export default AreaRegistry
