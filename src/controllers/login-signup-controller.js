import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
import Password from '../password';
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
        issues = issues.concat(Password.getPasswordValidationIssues($('#login-password').val().trim()));
        if (!$('#acceptLicense').is(':checked')) {
            issues.push('You must agree to the license to proceed');
        }
        return issues;
    }
    async function signupUser() {
        setError('');
        let validation = getFieldValidation();
        if (validation.length > 0) {
            setError(validation);
            return;
        }
        let dataClient = new DataClient();
        let response = await dataClient.post('unauthenticated/signup',
            {
                email: $('#login-username').val().trim(),
                password: $('#login-password').val().trim(),
                agreedToLicense: $('#acceptLicense').is(':checked')
            });
        setError('');
        $('.signup-form').addClass('hide');
        $('#successMessageAlert').removeClass('hide');
        $('#successMessageAlert').text(response.status);
    }
    async function initAsync() {
        $('#sign-up-button').click(async function () {
            try {
                await signupUser();
            } catch (error) {
                setError(JSON.stringify(error));
            }
        });
    }
    this.init = function () {
        new AccountSettingsController().init({}, null, false);
        initAsync().catch(err => { Util.log(err); });
    };
}

module.exports = LoginSignupController;