const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', 
    createProxyMiddleware({
      target: 'https://wordle-production-5838.up.railway.app/', // Replace with your actual Railway backend URL
      changeOrigin: true,
      pathRewrite: {'^/api' : ''} // You can adjust or remove pathRewrite based on your backend routing
    })
  );
};
