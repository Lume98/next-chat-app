"use client";

import "@scalar/api-reference-react/style.css";
import { ApiReferenceReact } from "@scalar/api-reference-react";

export function ApiReference() {
  return (
    <ApiReferenceReact
      configuration={{
        url: "/api/openapi",
        theme: "purple",
        searchHotKey: "k",
        hideDownloadButton: false,
        showSidebar: true,
      }}
    />
  );
}
