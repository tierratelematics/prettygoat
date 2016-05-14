import { ProjectionEngine } from "./scripts/boilerplate"
import { CountProjection, SimpleProjection, GroupedProjection } from "./scripts/projections"

let engine = new ProjectionEngine()

engine.register(new CountProjection())
engine.register(new SimpleProjection())
engine.register(new GroupedProjection())

engine.run()