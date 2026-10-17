const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  trailingSlash: true,
  turbopack: { root: path.resolve(__dirname, "..") },
};
