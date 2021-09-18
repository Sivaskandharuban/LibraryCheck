'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const Utils_1 = require("./Utils");
const mcAccessToken = require("mc_generic_methods");
class SfmcApiHelper {
    constructor() {
        // Instance variables
        this.client_id = "";
        this.client_secret = "";
        // private _accessToken = "";
        this.oauthAccessToken = "";
        this.member_id = "514018007";
        this.soap_instance_url = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.soap.marketingcloudapis.com/";
        this._deExternalKey = "DF20Demo";
        this._sfmcDataExtensionApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.rest.marketingcloudapis.com/hub/v1/dataevents/key:" + this._deExternalKey + "/rowset";
        this.refreshToken = "";
    }
    /**
     * getOAuthAccessToken: POSTs to SFMC Auth URL to get an OAuth access token with the given ClientId and ClientSecret
     *
     * More info: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-getting-started.meta/mc-getting-started/get-access-token.htm
     *
 public getOAuthAccessToken(
    clientId: string,
    clientSecret: string,
    req: any,
    res: any
  ): Promise<any> {
    let self = this;
    var tssd = "";
    tssd = req.body.tssd ? req.body.tssd : process.env.BASE_URL;
    console.log("authorizetssd:" + tssd);
    let headers = {
      "Content-Type": "application/json",
    };

    let postBody = {
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code: req.body.authorization_code,
      redirect_uri: process.env.REDIRECT_URL,
    };

    return self.getOAuthTokenHelper(headers, postBody, res, tssd);
  }

  /**
   * getOAuthTokenHelper: Helper method to POST the given header & body to the SFMC Auth endpoint
   *
   */
    getOAuthAccessToken(clientId, clientSecret, req, res) {
        let self = this;
        var tssd = "";
        tssd = req.body.tssd ? req.body.tssd : process.env.BASE_URL;
        console.log("authorizetssd:" + tssd);
        let headers = {
            "Content-Type": "application/json",
        };
        let postBody = {
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret,
            code: req.body.authorization_code,
            redirect_uri: process.env.REDIRECT_URL,
        };
        return self.getOAuthTokenHelper(headers, postBody, res, tssd);
    }
    getOAuthTokenHelper(headers, postBody, res, tssd) {
        let accessTokenMethod = new mcAccessToken.default();
        accessTokenMethod.getOAuthAccessToken(postBody.client_id, postBody.client_secret, postBody.grant_type, postBody.code, postBody.redirect_uri)
            .then((res) => {
            console.log("AccessToken Method from library", res.data);
            this.refreshToken = res.data.refresh_token;
        }).catch((err) => {
            console.error("error getting access token from library" + err);
        });
        accessTokenMethod.getRefreshToken(this.refreshToken, process.env.BASE_URL, postBody.client_id, postBody.client_secret)
            .then((response) => {
            console.log("Refresh token Method from library", response.customResponse);
        }).catch((err) => {
            console.error("error getting refresh token from library" + err);
        });
        return new Promise((resolve, reject) => {
            console.log("author" + JSON.stringify(postBody.code));
            console.log("headers", headers);
            let sfmcAuthServiceApiUrl = "https://mcj6cy1x9m-t5h5tz0bfsyqj38ky.auth.marketingcloudapis.com/v2/token";
            // this.isAccessToken = true;
            console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
            axios_1.default
                .post(sfmcAuthServiceApiUrl, postBody, { headers: headers })
                .then((response) => {
                let refreshToken = response.data.refresh_token;
                this.getRefreshTokenHelper(refreshToken, tssd, true, res);
            })
                .catch((error) => {
                // error
                let errorMsg = "Error getting OAuth Access Token.";
                errorMsg += "\nMessage: " + error.message;
                errorMsg +=
                    "\nStatus: " + error.response ? error.response.status : "<None>";
                errorMsg +=
                    "\nResponse data: " + error.response
                        ? Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data))
                        : "<None>";
                Utils_1.default.logError(errorMsg);
                reject(errorMsg);
            });
        });
    }
    //Helper method to get refresh token
    getRefreshTokenHelper(refreshToken, tssd, returnResponse, res) {
        return new Promise((resolve, reject) => {
            console.log("tssdrefresh:" + tssd);
            console.log("returnResponse:" + returnResponse);
            console.log("refreshToken=>", refreshToken);
            let sfmcAuthServiceApiUrl = "https://" + tssd + ".auth.marketingcloudapis.com/v2/token";
            let headers = {
                "Content-Type": "application/json",
            };
            console.log("sfmcAuthServiceApiUrl:" + sfmcAuthServiceApiUrl);
            let postBody1 = {
                grant_type: "refresh_token",
                client_id: process.env.DF18DEMO_CLIENTID,
                client_secret: process.env.DF18DEMO_CLIENTSECRET,
                refresh_token: refreshToken,
            };
            axios_1.default
                .post(sfmcAuthServiceApiUrl, postBody1, { headers: headers })
                .then((response) => {
                let bearer = response.data.token_type;
                let tokenExpiry = response.data.expires_in;
                // this._accessToken = response.data.refresh_token;
                //this._oauthToken = response.data.access_token;
                Utils_1.default.logInfo("Auth Token:" + response.data.access_token);
                console.log("response.data.refresh_token", response.data.refresh_token, "response.data.access_token");
                const customResponse = {
                    refreshToken: response.data.refresh_token,
                    oauthToken: response.data.access_token,
                };
                if (returnResponse) {
                    res.status(200).send(customResponse);
                }
                resolve(customResponse);
            })
                .catch((error) => {
                let errorMsg = "Error getting refresh Access Token.";
                errorMsg += "\nMessage: " + error.message;
                errorMsg +=
                    "\nStatus: " + error.response ? error.response.status : "<None>";
                errorMsg +=
                    "\nResponse data: " + error.response
                        ? Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data))
                        : "<None>";
                Utils_1.default.logError(errorMsg);
                reject(errorMsg);
            });
        });
    }
    appUserInfo(req, res) {
        let self = this;
        console.log("req.body.tssd:" + req.body.tssd);
        console.log("req.body.trefreshToken:" + req.body.refreshToken);
        let userInfoUrl = "https://" + req.body.tssd + ".auth.marketingcloudapis.com/v2/userinfo";
        let access_token;
        self
            .getRefreshTokenHelper(req.body.refreshToken, req.body.tssd, false, res)
            .then((response) => {
            Utils_1.default.logInfo("refreshTokenbody:" + JSON.stringify(response.refreshToken));
            Utils_1.default.logInfo("AuthTokenbody:" + JSON.stringify(response.oauthToken));
            access_token = response.oauthToken;
            const refreshTokenbody = response.refreshToken;
            Utils_1.default.logInfo("refreshTokenbody1:" + JSON.stringify(refreshTokenbody));
            let headers = {
                "Content-Type": "application/json",
                Authorization: "Bearer " + access_token,
            };
            axios_1.default
                .get(userInfoUrl, { headers: headers })
                .then((response) => {
                console.log("userinfo>>>>", response.data.user.name);
                const getUserInfoResponse = {
                    member_id: response.data.organization.member_id,
                    soap_instance_url: response.data.rest.soap_instance_url,
                    rest_instance_url: response.data.rest.rest_instance_url,
                    refreshToken: req.body.refreshToken,
                    username: response.data.user.name
                };
                //Set the member_id into the session
                console.log("Setting active sfmc mid into session:" + getUserInfoResponse.member_id);
                req.session.sfmcMemberId = getUserInfoResponse.member_id;
                console.log("UserInfo>>>>>>", getUserInfoResponse.member_id);
                //this.CheckAutomationStudio(access_token, req.body.refreshToken, req.body.tssd, getUserInfoResponse.member_id);
                res.status(200).send(getUserInfoResponse);
            })
                .catch((error) => {
                // error
                let errorMsg = "Error getting User's Information.";
                errorMsg += "\nMessage: " + error.message;
                errorMsg +=
                    "\nStatus: " + error.response ? error.response.status : "<None>";
                errorMsg +=
                    "\nResponse data: " + error.response
                        ? Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data))
                        : "<None>";
                Utils_1.default.logError(errorMsg);
                res
                    .status(500)
                    .send(Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data)));
            });
        })
            .catch((error) => {
            res
                .status(500)
                .send(Utils_1.default.prettyPrintJson(JSON.stringify(error.response.data)));
        });
    }
}
exports.default = SfmcApiHelper;
;
//# sourceMappingURL=SfmcApiHelper.js.map