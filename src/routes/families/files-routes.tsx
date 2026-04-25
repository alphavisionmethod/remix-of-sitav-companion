import { Route } from "react-router-dom";
import { lazy } from "react";

const FilesCenter = lazy(() => import("@/pages/FilesCenter"));
const TrustCenter = lazy(() => import("@/pages/TrustCenter"));

export function getFilesRoutes() {
  return (
    <>
      <Route path="/files" element={<FilesCenter />} />
      <Route path="/files/overview" element={<FilesCenter />} />
      <Route path="/files/explorer" element={<FilesCenter />} />
      <Route path="/files/all" element={<FilesCenter />} />
      <Route path="/files/processing" element={<FilesCenter />} />
      <Route path="/files/review" element={<FilesCenter />} />
      <Route path="/files/search" element={<FilesCenter />} />
      <Route path="/files/memory" element={<FilesCenter />} />
      <Route path="/files/memory-review" element={<FilesCenter />} />
      <Route path="/files/sensitive" element={<FilesCenter />} />
      <Route path="/files/settings" element={<FilesCenter />} />

      {/* Trust */}
      <Route path="/trust" element={<TrustCenter />} />
      <Route path="/trust/autonomy" element={<TrustCenter />} />
      <Route path="/trust/devices" element={<TrustCenter />} />
      <Route path="/trust/permissions" element={<TrustCenter />} />
      <Route path="/trust/proof" element={<TrustCenter />} />
      <Route path="/trust/audit" element={<TrustCenter />} />
      <Route path="/trust/settings" element={<TrustCenter />} />
    </>
  );
}
