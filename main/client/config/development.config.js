const merge = require("webpack-merge");

module.exports = merge(require("./webpack.config"), {
    devServer: {
        port: 8082,
        host: "localhost",
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:8888",
                changeOrigin: false,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
});