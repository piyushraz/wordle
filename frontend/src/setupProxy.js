const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://wordle-production-5838.up.railway.app/',
            changeOrigin: true,
        })
    );
};
