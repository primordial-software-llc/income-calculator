import AccountSettingsController from './account-settings-controller';
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Password from '../password';
const OTPAuth = require('otpauth');
const QRCode = require('qrcode');
const Util = require('../util');
function LoginController() {
    'use strict';
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
        $('#forgot-password-button').click(async function() {
            MessageViewController.setMessage('');
            let username = $('#login-username').val().trim().toLowerCase();
            if (username.length < 1) {
                MessageViewController.setMessage('Username is required', 'alert-danger');
            }
            let cognitoUser = new AmazonCognitoIdentity.CognitoUser({
                Username : username,
                Pool : new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData())
            });
            cognitoUser.forgotPassword({
                onSuccess: function (result) {
                    MessageViewController.setMessage('A verification code has been sent to your email address. Enter the verification code below', 'alert-info');
                    $('.login-form').addClass('hide');
                    $('.forgot-password-verification-mode').removeClass('hide');
                },
                onFailure: function (err) {
                    Util.log(err)
                    MessageViewController.setMessage(JSON.stringify(err), 'alert-danger');
                }
            });
            $('#submit-password-reset-verification-code').click(async function() {
                MessageViewController.setMessage('');
                let username = $('#login-username').val().trim().toLowerCase();
                let cognitoUser = new AmazonCognitoIdentity.CognitoUser({
                    Username : username,
                    Pool : new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData())
                });
                let password = $('#forgot-password-new-password').val();
                let issues = Password.getPasswordValidationIssues(password);
                if (issues.length) {
                    MessageViewController.setMessage(issues, 'alert-danger');
                    return;
                }
                cognitoUser.confirmPassword(
                    $('#forgot-password-verification-code').val().trim(),
                    password,
                    {
                        onFailure(err) {
                            Util.log(err);
                            MessageViewController.setMessage(JSON.stringify(err), 'alert-danger');
                        },
                        onSuccess() {
                            MessageViewController.setMessage('Password reset.', 'alert-success');
                            $('#forgot-password-verification-code').val('');
                            $('#forgot-password-new-password').val('');
                            $('.login-form').removeClass('hide');
                            $('.forgot-password-verification-mode').addClass('hide');
                        },
                })
            });
        });
    }
    this.init = function () {
        new AccountSettingsController().init({}, null, false);
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = LoginController;