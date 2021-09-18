"use strict";
/*
 * Express App
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression"); // compresses requests
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const favicon = require("serve-favicon");
const session = require("express-session");
// import SfmcApiDemoRoutes from './SfmcApiDemoRoutes';
const SfmcAppDemoRoutes_1 = require("./SfmcAppDemoRoutes");
const PORT = process.env.PORT || 5000;
// Create & configure Express server
const app = express();
// Express configuration
app.set("port", PORT);
app.set("views", path.join(__dirname, "../views"));
app.set('view engine', 'ejs');
// Use helmet. More info: https://expressjs.com/en/advanced/best-practice-security.html
var helmet = require('helmet');
app.use(helmet());
// Allow X-Frame from Marketing Cloud. Sets "X-Frame-Options: ALLOW-FROM http://exacttarget.com".
app.use(helmet.frameguard({
    action: 'allow-from',
    domain: 'http://exacttarget.com'
}));
app.use(session({
    name: 'server-session-cookie-id',
    secret: 'sanagama-df18',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Setup static paths
app.use(express.static(path.join(__dirname, "../static")));
app.use(favicon(path.join(__dirname, '../static', 'images', 'favicons', 'favicon.ico')));
// Routes: pages
// app.get('/', function(req, res) { Utils.initSampleDataAndRenderView(req, res, 'apidemo.ejs') });
app.get("/", function (req, res) {
    if (req.query.code === undefined) {
        const redirectUri = `https://${process.env.BASE_URL}.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=${process.env.DF18DEMO_CLIENTID}&redirect_uri=${process.env.REDIRECT_URL}`;
        res.redirect(redirectUri);
    }
    else {
        res.render("apidemo.ejs", {
            authorization_code: req.query.code,
            tssd: req.query.tssd ? req.query.tssd : process.env.BASE_URL,
        });
        console.log("authorization_code=", req.query.code, "tssd=", process.env.BASE_URL);
    }
});
//  app.get('/appdemo', function(req, res) { Utils.initSampleDataAndRenderView(req, res, 'appdemo.ejs') });
//const apiDemoRoutes = new SfmcApiDemoRoutes();
const appDemoRoutes = new SfmcAppDemoRoutes_1.default();
// Routes: used by this demo app that internally call Marketing Cloud REST APIs
//app.get('/apidemooauthtoken', function(req, res) {
// apiDemoRoutes.getOAuthAccessToken(req, res); });
// app.get('/loaddata', function(req, res) {
//   apiDemoRoutes.loadData(req, res); });
// Routes: called when this demo app runs as a Marketing Cloud app in an IFRAME in the Marketing Cloud web UI
app.post('/appdemoauthtoken', function (req, res) {
    console.log("getOAuthAccessToken called");
    appDemoRoutes.getOAuthAccessToken(req, res);
});
app.post("/appuserinfo", function (req, res) {
    appDemoRoutes.appUserInfo(req, res);
});
// app.post("/createsparkpostintegrationfolder", function (req, res) {
//   appDemoRoutes.createSparkpostIntegrationFolder(req, res);
// });
// app.post("/creatingDomainConfigurationDE", function (req, res) {
//   appDemoRoutes.creatingDomainConfigurationDE(req, res);
// });
// // Marketing Cloud POSTs the JWT to the '/login' endpoint when a user logs in
// app.post('/login', function(req, res) {
//   appDemoRoutes.login(req, res); });
// // Marketing Cloud POSTs to the '/logout' endpoint when a user logs out
// app.post('/logout', function(req, res) {
//   appDemoRoutes.logout(req, res); });
module.exports = app;
//# sourceMappingURL=app.js.map