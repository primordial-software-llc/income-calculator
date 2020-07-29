import AccountSettingsController from './account-settings-controller';
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const DataClient = require('../data-client');
import MessageViewController from './message-view-controller';
const OTPAuth = require('otpauth');
const QRCode = require('qrcode');
const Util = require('../util');
function LoginController() {
    'use strict';
    function getAdditionalFieldValidation() {
        let issues = [];
        if ($('#login-new-password').val().trim().length < 1) {
            issues.push('New password is required');
        }
        if ($('#login-firstname').val().trim().length < 1) {
            issues.push('First name is required');
        }
        if ($('#login-lastname').val().trim().length < 1) {
            issues.push('Last name is required');
        }
        if ($('#login-phone').val().trim().length < 1) {
            issues.push('Phone number is required');
        }
        if ($('#login-address').val().trim().length < 1) {
            issues.push('Address is required');
        }
        return issues;
    }
    function getAuthCallback(cognitoUser, username, password) {
        return {
            onSuccess: async function (result) {
                MessageViewController.setMessage('');
                let dataClient = new DataClient();
                await dataClient.post('unauthenticated/setToken', {
                    idToken: result.getIdToken().getJwtToken(),
                    refreshToken: result.getRefreshToken().token
                });
                window.location=`${Util.rootUrl()}/pages/budget.html`;
            },
            onFailure: function(err) {
                MessageViewController.setMessage('');
                $('#login-username').prop('disabled', false);
                $('#login-password').prop('disabled', false);
                $('#login-username').val('');
                $('#login-password').val('');
                $('#mfaCode').val('');
                MessageViewController.setMessage(err.message || '', 'alert-danger');
            },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                MessageViewController.setMessage('');
                $('.login-form').addClass('hide');
                $('.form-additional-fields').removeClass('hide');
                $('#additional-fields-button').click(function () {
                    MessageViewController.setMessage('');
                    let issues = getAdditionalFieldValidation();
                    if (issues.length > 0) {
                        MessageViewController.setMessage(issues, 'alert-danger');
                        return;
                    }
                    let newPassword = $('#login-new-password').val().trim();
                    let newAttributes = {
                        "given_name": $('#login-firstname').val().trim(),
                        "family_name": $('#login-lastname').val().trim(),
                        'phone_number': $('#login-phone').val().trim(),
                        "address": $('#login-address').val().trim()
                    };
                    cognitoUser.completeNewPasswordChallenge(
                        newPassword,
                        newAttributes,
                        getAuthCallback(cognitoUser, username, newPassword));
                });
            },
            mfaRequired: function(codeDeliveryDetails) {
                let verificationCode = prompt('Please input verification code' ,'');
                cognitoUser.sendMFACode(verificationCode, this);
            },
            mfaSetup: function(challengeName, challengeParameters) {
                cognitoUser.associateSoftwareToken(this);
            },
            associateSecretCode : function(secretCode) {
                MessageViewController.setMessage('', 'alert-danger');
                $('.login-form').addClass('hide');
                $('.form-additional-fields').addClass('hide');
                let totp = new OTPAuth.TOTP({
                    issuer: 'Primordial Software LLC',
                    label: username,
                    algorithm: 'SHA1',
                    digits: 6,
                    period: 30,
                    secret: secretCode
                });
                let qrCodeUrlData = totp.toString();
                QRCode.toDataURL(qrCodeUrlData,
                    { errorCorrectionLevel: 'H', mode: 'alphanumeric' },
                    function (err, url) {
                        $('#qr-code-container').append(`<img src="${encodeURI(url)}" />`);
                        $('.mfa-form').removeClass('hide');
                        $('#mfa-button').unbind();
                        MessageViewController.setMessage('Scan the QR code with <a target="_blank" href="https://support.google.com/accounts/answer/1066447?co=GENIE.Platform%3DAndroid&hl=en">Google Authenticator</a>, enter the one time password, then sign in.', 'alert-info', true);
                        $('#mfa-button').click(function () {
                            cognitoUser.verifySoftwareToken($('#mfaCode').val().trim(), 'TOTP device', getAuthCallback(cognitoUser, username, password));
                        });
                    });
            },
            totpRequired : function(secretCode) {
                MessageViewController.setMessage('');
                $('.login-form').addClass('hide');
                $('.mfa-confirm-form').removeClass('hide');
                $('#mfa-confirm-button').unbind();
                $(document).on('keypress.mfa-confirm-submit', function(e) {
                    if(e.which === 13 && !$('.mfa-confirm-form').hasClass('hide')) {
                        cognitoUser.sendMFACode($('#mfa-confirm-code').val(), getAuthCallback(cognitoUser, username, password), 'SOFTWARE_TOKEN_MFA')
                    }
                });
                $('#mfa-confirm-button').click(function () {
                    cognitoUser.sendMFACode($('#mfa-confirm-code').val(), getAuthCallback(cognitoUser, username, password), 'SOFTWARE_TOKEN_MFA')
                });
            }
        };
    }
    async function login(username, password) {
        username = (username || '').toLowerCase();
        let authenticationData = {
            Username : username,
            Password : password,
        };
        let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        let cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username : username,
            Pool : new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData())
        });
        cognitoUser.authenticateUser(authenticationDetails, getAuthCallback(cognitoUser, username, password));
    }
    async function initAsync() {
        $('#sign-in-button').click(async function () {
            MessageViewController.setMessage('', 'alert-danger');
            await login($('#login-username').val().trim(), $('#login-password').val().trim());
        });
    }
    this.init = function () {
        new AccountSettingsController().init({}, null, false);
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = LoginController;