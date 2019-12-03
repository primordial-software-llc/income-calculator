const AccountSettingsController = require('./account-settings-controller');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const Util = require('../util');
function LoginSignupController() {
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
    function getFieldValidation() {
        let issues = [];
        if ($('#login-username').val().trim().length < 1) {
            issues.push('Email is required');
        }
        if ($('#login-password').val().trim().length < 1) {
            issues.push('Password is required');
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
        if ($('#login-date-of-birth').val().trim().length < 1) {
            issues.push('Date of birth is required');
        }
        if ($('#login-address').val().trim().length < 1) {
            issues.push('Address is required');
        }
        if (!$('#acceptLicense').is(':checked')) {
            issues.push('You must agree to the license to proceed');
        }
        return issues;
    }
    function signupUser() {
        let userPool = new AmazonCognitoIdentity.CognitoUserPool(Util.getPoolData());
        let email = $('#login-username').val().trim();
        let password = $('#login-password').val().trim();
        let attributeList = [
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'email', Value: email }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'given_name', Value: $('#login-firstname').val().trim() }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'family_name', Value: $('#login-lastname').val().trim() }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'phone_number', Value: $('#login-phone').val().trim() }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'birthdate', Value: $('#login-date-of-birth').val().trim() }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'address', Value: $('#login-address').val().trim() })
        ];
        userPool.signUp(email, password, attributeList, null, function(
            error,
            result
        ) {
            if (error) {
                setError(error.message || JSON.stringify(error));
                return;
            }
            setError('');
            $('.signup-form').addClass('hide');
            $('#successMessageAlert').removeClass('hide');
            $('#successMessageAlert').text(`Your user has successfully been created. ` +
                                            `Your user name is ${result.user.getUsername()}. ` +
                                            `A confirmation link has been sent to your email from noreply@primordial-software.com. ` +
                                            `You need to click the verification link in the email before you can login.`);
        });
    }
    async function initAsync() {
        $('#sign-up-button').click(async function () {
            setError('');
            let validation = getFieldValidation();
            if (validation.length > 0) {
                setError(validation);
                return;
            }
            signupUser();
        });
    }
    this.init = function () {
        new AccountSettingsController().init();
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = LoginSignupController;