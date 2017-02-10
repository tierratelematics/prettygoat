import IFilterStrategy from "../../scripts/filters/IFilterStrategy";
import IFilterContext from "../../scripts/filters/IFilterContext";
import FilterOutputType from "../../scripts/filters/FilterOutputType";

export class ContentFilterStrategy implements IFilterStrategy<any> {

    filter(state: any, context: IFilterContext): {filteredState: any; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.CONTENT
        }
    }

}

export class ForbiddenFilterStrategy implements IFilterStrategy<any> {

    filter(state: any, context: IFilterContext): {filteredState: any; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.FORBIDDEN
        }
    }

}

export class UnauthorizedFilterStrategy implements IFilterStrategy<any> {

    filter(state: any, context: IFilterContext): {filteredState: any; type: FilterOutputType} {
        return {
            filteredState: state,
            type: FilterOutputType.UNAUTHORIZED
        }
    }

}