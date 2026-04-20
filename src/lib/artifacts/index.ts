// Public barrel for the artifact viewer data layer.
export type {
  ArtifactCategory,
  ArtifactCategoryGroup,
  ArtifactIndex,
  PublicArtifact,
} from "./types";
export { loadArtifactIndex, clearArtifactIndexCache } from "./loadArtifactIndex";
export { loadArtifact, type LoadedArtifact } from "./loadArtifact";
