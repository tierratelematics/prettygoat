import Dictionary from "../Dictionary";
import {IProjection} from "./IProjection";

interface IProjectionSorter{
    topologicGraph: string[][];
    topologicSort():string[]
}

export default IProjectionSorter