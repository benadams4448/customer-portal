"use client";

import { ThemeProvider } from "@mui/material";

import ProviderOrgDetailsProvider from "src/providers/ProviderOrgDetailsProvider";

import ProjectsPage from "../../app/(workspace)/projects/page";
import { theme } from "../../styles/theme";

const DesignerPreview = () => (
  <ThemeProvider theme={theme}>
    <ProviderOrgDetailsProvider details={{ id: "design-preview", orgName: "Client workspace" }}>
      <ProjectsPage />
    </ProviderOrgDetailsProvider>
  </ThemeProvider>
);

export default DesignerPreview;
