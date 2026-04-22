import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const pages = [
  ["NotesWorkspace", () => import("@/pages/NotesWorkspace")],
  ["MediaWorkspace", () => import("@/pages/MediaWorkspace")],
  ["DocumentEditor", () => import("@/pages/DocumentEditor")],
  ["ImportExportCenter", () => import("@/pages/ImportExportCenter")],
  ["SovereignExportPage", () => import("@/pages/SovereignExportPage")],
  ["DocsWorkspace", () => import("@/pages/workspace/DocsWorkspace")],
  ["OperatorWorkspace", () => import("@/pages/workspace/OperatorWorkspace")],
  ["PrincipalWorkspace", () => import("@/pages/workspace/PrincipalWorkspace")],
  ["FilesCenter", () => import("@/pages/FilesCenter")],
  ["FilesAll", () => import("@/pages/files/FilesAll")],
  ["FilesOverview", () => import("@/pages/files/FilesOverview")],
  ["FilesProcessing", () => import("@/pages/files/FilesProcessing")],
  ["FilesReview", () => import("@/pages/files/FilesReview")],
  ["FilesSearch", () => import("@/pages/files/FilesSearch")],
  ["FilesSensitive", () => import("@/pages/files/FilesSensitive")],
  ["FilesSettings", () => import("@/pages/files/FilesSettings")],
  ["FilesMemoryReview", () => import("@/pages/files/FilesMemoryReview")],
  ["ReportingWorkspace", () => import("@/pages/ReportingWorkspace")],
] as const;

describe("Workspace Pages", () => {
  pages.forEach(([name, loader]) => {
    it(`${name} renders without crashing`, async () => {
      const mod: any = await loader();
      const Component = mod.default || Object.values(mod).find((v: any) => typeof v === "function");
      const { container } = render(<Component />, { authenticated: true });
      expect(container).toBeTruthy();
    });
  });
});
