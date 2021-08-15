import AccountSettingsController from './account-settings-controller';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Navigation from '../nav';
const Util = require('../util');
export default class PropertySettingsController {
    static getName() {
        return 'Settings';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-settings.html`;
    }
    static hideInNav() {
        return true;
    }
    static showInPropertyNav() {
        return true;
    }
    async init(user) {
        let self = this;
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertySettingsController.getUrl()));
        new AccountSettingsController().init({}, user, false);
        let userPropertyLocation = $('#user-property-location');
        let dataClient = new DataClient();
        let locations;
        try {
            locations = await dataClient.get(`point-of-sale/location`);
        } catch (error) {
            Util.log(error);
            MessageViewController.setRequestErrorMessage(error);
            return;
        }
        const UNSELECTED_LOCATION = 'Select a location';
        userPropertyLocation.append($("<option />").val(UNSELECTED_LOCATION).text(UNSELECTED_LOCATION));
        for (let location of locations) {
            userPropertyLocation.append(
                $("<option />").val(location.id).text(location.name)
            );
        }
        userPropertyLocation.val(user.propertyLocationId || '');

        $('#user-email').text(user.email);
        $('#user-first-name').text(user.firstName);
        $('#user-last-name').text(user.lastName);

        $('#property-settings-save').click(async function () {
            let data = {};
            data.propertyLocationId = userPropertyLocation.val();
            if (data.propertyLocationId.toLowerCase() === UNSELECTED_LOCATION.toLowerCase()) {
                MessageViewController.setMessage('A location must be selected.', 'alert-danger');
                userPropertyLocation.addClass('required-field-validation');
                return;
            }

            $('#user-property-location').removeClass('required-field-validation');
            MessageViewController.setMessage('');

            try {
                let dataClient = new DataClient();
                let response = await dataClient.patch('budget', data);
                MessageViewController.setMessage('Settings updated.', 'alert-success')
            } catch (err) {
                Util.log(err);
                MessageViewController.setRequestErrorMessage(error);
            }
        });
    }
}