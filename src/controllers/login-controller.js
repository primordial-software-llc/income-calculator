const AccountSettingsController = require('./account-settings-controller');
const DataClient = require('../data-client');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const OTPAuth = require('otpauth');
const QRCode = require('qrcode');
const Util = require('../util');
function LoginController() {
    'use strict';
    let dataClient;
    let settings;
    async function login(username, password) {
        let poolData = {
            UserPoolId : 'us-east-1_CJmKMk0Fw',
            ClientId : '1alsnsg84noq81e7f2v5vru7m7'
        };
        let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        let userData = {
            Username : username,
            Pool : userPool
        };
        let authenticationData = {
            Username : username,
            Password : password,
        };
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        let userAuthCallbacks = {
            onSuccess: async function (result) {
                document.cookie = `idToken=${result.getIdToken().getJwtToken()};Secure;path=/`;
                window.location=`${Util.rootUrl()}/pages/balance-sheet.html${window.location.search}`;
            },
            onFailure: function(err) {
                console.log('failed to authenticate');
                console.log(err);
                $('#login-username').prop('disabled', false);
                $('#login-password').prop('disabled', false);
                $('#login-username').val('');
                $('#login-password').val('');
                $('#mfaCode').val('');
                alert('failed to authenticate');
            },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                console.log(userAttributes);
                console.log(requiredAttributes);
                let newPassword = 's_ChLcruwr3x85J';
                let newAttributes = {
                    "family_name": 'Gonzalez',
                    "given_name": 'Timothy',
                    "address": 'Blue Iris Ln'
                };
                cognitoUser.completeNewPasswordChallenge(newPassword, newAttributes,  {
                    onSuccess: function (result) {
                        console.log(result);
                    },
                    onFailure: function(err) {
                        console.log(err);
                    }
                });
            },
            mfaRequired: function(codeDeliveryDetails) {
                var verificationCode = prompt('Please input verification code' ,'');
                cognitoUser.sendMFACode(verificationCode, this);
            },
            mfaSetup: function(challengeName, challengeParameters) {
                console.log(challengeName);
                console.log(challengeParameters);
                cognitoUser.associateSoftwareToken(this);
            },
            associateSecretCode : function(secretCode) {
                console.log(secretCode);
                let totp = new OTPAuth.TOTP({
                    issuer: 'Primordial Software LLC',
                    label: username,
                    algorithm: 'SHA1',
                    digits: 6,
                    period: 30,
                    secret: secretCode
                });
                let qrCodeUrlData = totp.toString();
                console.log(qrCodeUrlData);
                QRCode.toDataURL(qrCodeUrlData,
                    { errorCorrectionLevel: 'H', mode: 'alphanumeric' },
                    function (err, url) {
                        $('#qr-code-container').append(`<img src="${encodeURI(url)}" />`);
                        setTimeout(function() {
                                var challengeAnswer = prompt('Please input the TOTP code.' ,'');
                                cognitoUser.verifySoftwareToken(challengeAnswer, 'My TOTP device', this);
                            },
                            1000);
                    });
            },
            selectMFAType : function(challengeName, challengeParameters) {
                var mfaType = prompt('Please select the MFA method.', '');
                cognitoUser.sendMFASelectionAnswer(mfaType, this);
            },
            totpRequired : function(secretCode) {
                $('.login-form').addClass('hide');
                $('.mfa-form').removeClass('hide');
                $('#mfa-button').unbind();
                $('#mfa-button').click(function () {
                    cognitoUser.sendMFACode($('#mfaCode').val(), userAuthCallbacks, 'SOFTWARE_TOKEN_MFA')
                });
            }
        };
        cognitoUser.authenticateUser(authenticationDetails, userAuthCallbacks);
    };
    async function initAsync() {
        $('#sign-in-button').click(async function () {
            await login($('#login-username').val().trim(), $('#login-password').val().trim());
        });
    }
    this.init = function (settingsIn) {
        settings = settingsIn;
        dataClient = new DataClient(settings);
        new AccountSettingsController().init(settings);
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = LoginController;