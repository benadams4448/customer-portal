const next = require("next");
const express = require("express");
const path = require("path");
const { startMailServiceCron } = require("./src/server/mail-service/mail-cron");
const verifyEnvrionmentVariables = require("./src/server/utils/verifyEnvironmentVariables");
const { isProjectWorkspacePreview } = require("./src/server/utils/projectWorkspacePreview");

const dev = process.env.NODE_ENV !== "production";
const hostname = isProjectWorkspacePreview() ? "127.0.0.1" : "localhost";
const port = dev ? 3000 : 8080;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const expressApp = express();

app.prepare().then(async () => {
  const projectPreview = isProjectWorkspacePreview();
  //check if all required environement variables are available
  const { isVerified, envVariablesStatus } = projectPreview
    ? { isVerified: false, envVariablesStatus: {} }
    : await verifyEnvrionmentVariables();

  console.log("Environment variables status", envVariablesStatus);
  if (isVerified) {
    if (process.env.NODE_INDEX === undefined || process.env.NODE_INDEX === 0 || process.env.NODE_INDEX === "0") {
      //start the mail service cron job only if
      //a)NODE_INDEX environment variable is not present
      //b)NODE_INDEX environment variable === 0
      startMailServiceCron();
    }
  }
  expressApp.set("view engine", "ejs");
  expressApp.set("views", path.join(__dirname, "src/server/views"));
  if (projectPreview) {
    expressApp.use((request, response, nextMiddleware) => {
      if (request.path === "/") return response.redirect("/projects");
      if (
        request.path === "/projects" ||
        request.path === "/projects/" ||
        request.path.startsWith("/_next/static/") ||
        request.path === "/_next/webpack-hmr" ||
        request.path === "/favicon.ico"
      ) {
        return nextMiddleware();
      }
      return response.status(404).send("Local preview only serves the sample project workspace at /projects.");
    });
  }
  expressApp.use(express.static(path.join(__dirname, "public")));
  expressApp.use(async (request, response) => {
    try {
      if (!projectPreview && !isVerified && process.env.NODE_ENV === "development") {
        return response.render("pages/setup-error", {
          envVariablesStatus,
        });
      }
      await handle(request, response);
    } catch {
      response.render("pages/error");
    }
  });

  expressApp.listen(port, projectPreview ? "127.0.0.1" : undefined, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
