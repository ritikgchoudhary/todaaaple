const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware(
      (pathname) =>
        pathname.startsWith("/admin-api") ||
        pathname.startsWith("/carousel") ||
        pathname.startsWith("/user") ||
        pathname.startsWith("/uploads") ||
        pathname.startsWith("/site-settings") ||
        pathname.startsWith("/get") ||
        pathname.startsWith("/signin") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/apply") ||
        pathname.startsWith("/add") ||
        pathname.startsWith("/reset") ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/process") ||
        pathname.startsWith("/game") ||
        pathname.startsWith("/create"),
      {
        target: "http://localhost:" + (process.env.REACT_APP_API_PORT || "4001"),
        changeOrigin: true,
      }
    )
  );
};
