import * as _ from "lodash";
import {WhenBlock} from "../projections/Matcher";

export default class DefinitionUtil {

    static getManifests(definition: WhenBlock<any>): string[] {
        return _(definition).keys().filter(key => key !== "$init").valueOf();
    }
}
