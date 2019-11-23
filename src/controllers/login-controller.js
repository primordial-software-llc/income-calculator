const AccountSettingsController = require('./account-settings-controller');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const OTPAuth = require('otpauth');
const QRCode = require('qrcode');
const Util = require('../util');
function LoginController() {
    'use strict';
    function setError(errorMessage) {
        errorMessage = errorMessage || '';
        if (Array.isArray(errorMessage)) {
            for (let errorMessageItem of errorMessage) {
                console.log(errorMessageItem);
                $('#errorMessageAlert').append($(`<div>&bull;&nbsp;${errorMessageItem}</div>`));
            }
        } else {
            $('#errorMessageAlert').text(errorMessage);
        }
        if (errorMessage.length < 1) {
            $('#errorMessageAlert').addClass('hide');
        } else {
            $('#errorMessageAlert').removeClass('hide');
        }
    }
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
                document.cookie = `idToken=${result.getIdToken().getJwtToken()};Secure;path=/`;
                document.cookie = `refreshToken=${result.getRefreshToken().token};Secure;path=/`;
                window.location=`${Util.rootUrl()}/pages/balance-sheet.html`;
            },
            onFailure: function(err) {
                $('#login-username').prop('disabled', false);
                $('#login-password').prop('disabled', false);
                $('#login-username').val('');
                $('#login-password').val('');
                $('#mfaCode').val('');

                console.log('failed to authenticate');
                console.log(err);

                setError(err.message || '');
            },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                $('.login-form').addClass('hide');
                $('.form-additional-fields').removeClass('hide');
                $('#additional-fields-button').click(function () {
                    setError('');
                    let issues = getAdditionalFieldValidation();
                    if (issues.length > 0) {
                        setError(issues);
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
                var verificationCode = prompt('Please input verification code' ,'');
                cognitoUser.sendMFACode(verificationCode, this);
            },
            mfaSetup: function(challengeName, challengeParameters) {
                cognitoUser.associateSoftwareToken(this);
            },
            associateSecretCode : function(secretCode) {
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
                        setTimeout(function() {
                                var challengeAnswer = prompt('Scan the QR code with google authenticator and enter the one time code.' ,'');
                                cognitoUser.verifySoftwareToken(challengeAnswer, 'My TOTP device', getAuthCallback(cognitoUser, username, password));
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
                    setError('');
                    cognitoUser.sendMFACode($('#mfaCode').val(), getAuthCallback(cognitoUser, username, password), 'SOFTWARE_TOKEN_MFA')
                });
            }
        };
    }
    async function login(username, password) {
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
            setError('');
            await login($('#login-username').val().trim(), $('#login-password').val().trim());
        });
    }
    this.init = function () {
        new AccountSettingsController().init();
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = LoginController;