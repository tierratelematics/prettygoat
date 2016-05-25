import { IProjection } from "./IProjection";

export class ProjectionErrors {
    public static NoName = "Projection has no name";
    public static NoSource = "Projection requires a stream source";
    public static NoDefinition = "Projection requires an event handling definition";
}

export class ProjectionAnalyzer {
    analyze<T>(projection: IProjection<T>): Array<string> {
        let result = new Array<string>();

        if (!projection.name || projection.name.trim() === "")
            result.push(ProjectionErrors.NoName);

        if (!projection.streamSource)
            result.push(ProjectionErrors.NoSource);

        if (!projection.definition)
            result.push(ProjectionErrors.NoDefinition);
        return result;
    }
}
