const isProjectWorkspacePreview = () =>
  process.env.NODE_ENV === "development" && process.env.PROJECT_WORKSPACE_PREVIEW === "true";

module.exports = { isProjectWorkspacePreview };
