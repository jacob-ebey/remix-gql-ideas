const { flatRoutes } = require("remix-flat-routes");

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  // ignoredRouteFiles: ["**/.*", "**/*.query.ts"],
  ignoredRouteFiles: ["**/*"],
  routes: async (defineRoutes) => {
    const routes = flatRoutes("routes", defineRoutes);

    return Object.entries(routes).reduce((acc, [routeId, route]) => {
      if (routeId.endsWith(".query")) {
        return acc;
      }
      acc[routeId] = route;
      return acc;
    }, {});
  },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
};
