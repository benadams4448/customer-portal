if (process.env.NODE_ENV === "production") {
  throw new Error("Workspace preview is only available in development.");
}

process.env.NODE_ENV = "development";
process.env.PROJECT_WORKSPACE_PREVIEW = "true";

require("../server.js");
