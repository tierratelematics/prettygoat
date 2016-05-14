import { ProjectionEngine } from "./scripts/boilerplate";
import { CountProjection, SimpleProjection, SplitProjection } from "./scripts/projections";

let engine = new ProjectionEngine();

engine.register(new CountProjection());
engine.register(new SimpleProjection());
engine.register(new SplitProjection());

engine.run();
