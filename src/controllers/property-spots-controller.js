import AccountSettingsController from './account-settings-controller';
import SpotView from '../views/property-spots/spot-view';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Moment from 'moment/moment';
import Util from '../util';
import CustomerDescription from '../customer-description';
import Navigation from '../nav';

export default class PropertySpotsController {
    static getName() {
        return 'Map';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-spots.html`;
    }
    static hideInNav() {
        return true;
    }
    static showInPropertyNav() {
        return true;
    }
    // Need to go through and move everyone who had their spot removed from being marked as inactive.
    // For now temporarily, active vendors are ordered first.
    getVendorWhoReservedSpot(spotId) {
        return this.getOneTimeSpotReservationVendor(spotId) ||
            this.getIndefiniteSpotReservationVendor(spotId);
    }
    getIndefiniteSpotReservationVendor(spotId) {
        var customerCopy = JSON.parse(JSON.stringify(this.customers));
        customerCopy.sort((a, b) => b.isActive - a.isActive);
        return customerCopy.find(vendor => vendor.spots && vendor.spots.find(spot => spot.id === spotId));
    }
    getOneTimeSpotReservationVendor(spotId) {
        let oneTimeSpotReservation = this.spotReservations.find(x => x.spotId === spotId);
        if (oneTimeSpotReservation) {
            return this.customers.find(x => x.quickBooksOnlineId === oneTimeSpotReservation.quickBooksOnlineId);
        }
    }
    getRow(firstSpot, spots) {
        let row = [];
        if (!firstSpot) {
            return row;
        }
        let currentSpot = firstSpot;
        let ct = 1;
        do {
            row.push(currentSpot);
            currentSpot = spots.find(x => x.id === currentSpot.right);
            ct += 1;
            if (ct > 1000) {
                break; // Sanity check for loops, because I have no validation.
            }
        } while(currentSpot);
        return row;
    }
    getTopLeftSpotIds() {
        return [
            'ad0b0efe-52fe-43f6-b2ac-a2c2b3537440', // 79
            '50ff2d87-2a87-4934-a20b-cd4c668c85c9', // 119
            'dc30099b-e56d-4b16-b691-77c01fcb54d3', // 38
            '916250b8-505c-4fae-87a8-e119cdc46826', // 159
            'a015cb31-e6b3-449f-8be9-fd0a872cc32f', // 199
            '51e6c980-81e4-4f7a-804d-a414875a82a4', // 239
            '7cbad948-f2f1-4930-8dd6-f930f7df4518', // building 7
            '3d737dc0-6675-4530-9018-1e2db6a73774', // 301 building 8
            '39885837-2841-417f-ba82-9b2c0db70458', // Rear sheds s24
            '4b0da4b7-e066-4dbe-bdb0-4b143ebf0991', // Field S
            '5133d373-ce65-88c6-bf6f-d1999acbe338', // Field A North Walkway
            '374ff735-0380-167d-775b-77e6a4b824a1', // Field B North Walkway
            'f269ac86-9d52-d72f-dc14-c53bd6a03abe', // Field C North Walkway
            'ab4c4446-0f34-8496-6410-3d8ef38371de', // Field D North Walkway
            '02ab4f7a-3fb8-eb8d-a64f-27d08df5ead9', // Field E North Walkway
            'e71c2187-22f7-2297-908a-051a29f98d09', // Field F North Walkway
            '03263698-e1c8-5dcc-0ce7-d2354a83677e', // Field G North Walkway
            '4a7822d7-891b-4cd7-93c6-91ef6d8f9e36', // Field H North Walkway
            '9365d417-430e-447f-811c-37e8e64a3b4e', // Field I Parking
            '8edfa4f7-734c-4c3f-97b7-77d142ca60f8', // Field J Parking
            '2c838bb8-21ea-4b68-940f-3ea4da068617', // Field K Parking
            'e920ac13-8314-48e4-9609-e9f1a9cf6407', // Field L Parking
            'a8f4d1d7-a3c4-4def-b969-06a544ec3424' // South walkway South walkway
        ];
    }
    getSectionView(section) {
        let sectionId = `spot-container-${section.id}`;
        let sectionView = $(`<div class="spot-container" id="${sectionId}">${section.name}</div>`);
        let sectionSpots = this.spots.filter(x => (x.section == null ? '' : x.section.id) === section.id);
        let leftSpot = sectionSpots.find(x => this.getTopLeftSpotIds().find(y => x.id === y));
        if (!leftSpot) {
            return sectionView;
        }
        let ct = 1;
        do {
            let row = this.getRow(leftSpot, sectionSpots);
            let rowContainer = $(`<div class="spot-row-container"></div>`);
            for (let rowIndex = 0; rowIndex < row.length; rowIndex++) {
                let spot = row[rowIndex];
                let cell = $('<div class="spot-cell-container"></div>');
                let heightInFeet;
                let widthInFeet;
                if (!spot.section ? -1 : spot.section.name.toLowerCase().indexOf('field') > -1) {
                    heightInFeet = 20;
                    widthInFeet = 20;
                } else if ((section.name || '').toLowerCase() === 'rear sheds') {
                    heightInFeet = 58
                    widthInFeet = 6.95;
                } else if ((section.name || '').toLowerCase() === 'building 8') {
                    heightInFeet = 58
                    widthInFeet = 10.3;
                } else {
                    heightInFeet = 10;
                    widthInFeet = 20;
                }
                if (spot.heightInFeet) {
                    heightInFeet = spot.heightInFeet;
                }
                const heightFeetToPixels = 5.15;
                const widthFeetToPixels = 15;
                cell.css('height', `${heightInFeet*heightFeetToPixels}px`);
                cell.css('width', `${widthInFeet*widthFeetToPixels}px`);
                do {
                    let reserver = this.getVendorWhoReservedSpot(spot.id);
                    let spotView = $(SpotView.getSpotView(spot, reserver, this.showBalances));
                    if (reserver) {
                        var customerDescription = CustomerDescription.getCustomerDescription(reserver);
                        spotView.find('.spot-vendor-link').text(customerDescription);
                        spotView.find('.spot-vendor-link').attr('title', customerDescription);
                        if (this.showBalances && reserver && reserver.balance > 1) {
                            spotView.find('.spot-vendor-details').text(`Balance: ${Util.format(reserver.balance)}`);
                        }
                    }
                    this.initSpotView(spotView, spot, section, sectionSpots);
                    cell.append(spotView);
                    spot = rowIndex === 0 ? undefined : sectionSpots.find(x => x.id === spot.bottom);
                } while (spot)
                cell.addClass(`spot-cell-with-parts-` + cell.children().length)
                rowContainer.append(cell);
            }
            sectionView.append(rowContainer);
            leftSpot = sectionSpots.find(x => x.id === leftSpot.bottom);
            ct += 1;
            if (ct > 1000) {
                break; // Sanity check for loops.
            }
        } while (leftSpot);
        return sectionView;
    }
    initSpotView(spotView, spot, section, sectionSpots) {
        let self = this;
        spotView.find('.spot-edit-btn').click(function() {
            spotView.find('.form').removeClass('hide');
        });
        let availableBottomSpots = sectionSpots.filter(x =>
            !sectionSpots.find(y => x.id === y.bottom) &&
            !sectionSpots.find(y => x.id === y.right) &&
            !this.getTopLeftSpotIds().find(y => x.id === y)
        );
        let availableRightSpots = availableBottomSpots.slice();
        let bottomIndex = 0;
        let rightIndex = 0;
        if (spot.bottom) {
            let bottomSpot = sectionSpots.find(x => x.id === spot.bottom);
            if (!bottomSpot) {
                let errorMessage = `Spot bottom of ${spot.id} - ${spot.section.name} - ${spot.name} was not found by id ${spot.bottom}. The spot may have been deleted or removed from the section ${spot.section.name}`;
                Util.log(errorMessage);
                MessageViewController.setMessage(errorMessage, 'alert-danger');
            } else {
                availableBottomSpots.push(bottomSpot);
                bottomIndex = availableBottomSpots.findIndex(x => x.id == spot.bottom) + 1;
            }
        }
        if (spot.right) {
            let rightSpot = sectionSpots.find(x => x.id === spot.right);
            if (!rightSpot) {
                let errorMessage = `Spot right of ${spot.id} - ${spot.section.name} - ${spot.name} was not found by id ${spot.right}. The spot may have been deleted or removed from the section ${spot.section.name}`;
                Util.log(errorMessage);
                MessageViewController.setMessage(errorMessage, 'alert-danger');
            } else {
                availableRightSpots.push(rightSpot);
                rightIndex = availableRightSpots.findIndex(x => x.id == spot.right) + 1;
            }
        }
        spotView.find('.spot-bottom').append(`<option value="">Select a Spot</option>`);
        spotView.find('.spot-right').append(`<option value="">Select a Spot</option>`);
        for (let spot of availableBottomSpots) {
            spotView.find('.spot-bottom').append(`<option value="${spot.id}">${section.name} - ${spot.name}</option>`);
        }
        for (let spot of availableRightSpots) {
            spotView.find('.spot-right').append(`<option value="${spot.id}">${section.name} - ${spot.name}</option>`);
        }
        spotView.find('.spot-bottom').prop('selectedIndex', bottomIndex);
        spotView.find('.spot-right').prop('selectedIndex', rightIndex);
        spotView.find('.spot-restricted-input').prop('checked', spot.restricted);
        spotView.find('.spot-edit-name').val(spot.name);
        spotView.find('.spot-edit-height').val(spot.heightInFeet);
        spotView.find('.spot-cancel').click(function() {
            spotView.find('.spot-bottom').prop('selectedIndex', bottomIndex);
            spotView.find('.spot-right').prop('selectedIndex', rightIndex);
            spotView.find('.spot-restricted-input').prop('checked', spot.restricted);
            spotView.find('.spot-edit-name').val(spot.name);
            spotView.find('.spot-edit-height').val(spot.heightInFeet);
            spotView.find('.form').addClass('hide');
        });
        spotView.find('.spot-save').click(async () => {
            let dataClient = new DataClient();
            let patch = {
                id: spot.id,
                bottom: spotView.find('.spot-bottom').val(),
                right: spotView.find('.spot-right').val(),
                restricted: spotView.find('.spot-restricted-input').is(":checked"),
                name: spotView.find('.spot-edit-name').val(),
                heightInFeet: spotView.find('.spot-edit-height').val()
            };
            let updatedSpot = await dataClient.patch('point-of-sale/spot', patch);
            let spotIndex = self.spots.findIndex(x => x.id === updatedSpot.id);
            self.spots[spotIndex] = updatedSpot;
            spotView.find('.form').addClass('hide');
            self.buildMap();
        });
    }
    setShowBalances(showBalances) {
        this.showBalances = showBalances;
    }
    buildMap() {
        $('.spot-sections-container').empty();

        // Top
        let fieldS = this.sections.find(x => x.id === '96f25b11-a287-4ab6-997f-b06bdc22a1a8');
        $('#spot-sections-container-top-top').append(this.getSectionView(fieldS));

        // Left
        let fieldL = this.sections.find(x => x.id === '3408b26a-b7ed-4e76-8a42-9b574181afae');
        let fieldK = this.sections.find(x => x.id === 'e8651c71-e5dd-4706-a18c-d2ee0e0da00c');
        let fieldJ = this.sections.find(x => x.id === '596c8ac6-ebf9-4438-9973-4a516288d7b9');
        let fieldI = this.sections.find(x => x.id === '2d2fa812-3bcb-4955-9a7c-63922e7392fa');
        fieldL.right = fieldK.id
        fieldK.right = fieldJ.id;
        fieldJ.right = fieldI.id;
        let leftSectionTopLeftSection = this.sections.find(x => x.id === fieldL.id);
        let leftSectionRow = this.getRow(leftSectionTopLeftSection, this.sections);
        for (let section of leftSectionRow) {
            $('#spot-sections-container-left').append(this.getSectionView(section));
        }

        // Middle middle
        let fieldH = this.sections.find(x => x.id === '47afac0b-67c2-4807-a88d-3ea9e1775661');
        let fieldG = this.sections.find(x => x.id === 'acddb4d0-1983-46b4-8d3c-e390f070bf0c');
        let fieldF = this.sections.find(x => x.id === 'cd7587ed-e3f5-4e81-b512-881a67f57ab8');
        let fieldE = this.sections.find(x => x.id === '469c1c7c-f2f9-4c64-9857-8567821b8adf');
        let fieldD = this.sections.find(x => x.id === 'dc55ee40-e618-4016-9ec3-b003d8e8fe52');
        let fieldC = this.sections.find(x => x.id === '2f62d887-39f4-44b7-92a2-4fd9bbecd423');
        let fieldB = this.sections.find(x => x.id === '3c27b448-514c-4d4b-bdd5-def1414e8d3b');
        let fieldA = this.sections.find(x => x.id === '96be73ae-cd0e-49ce-8dd2-ccf02fba1c30');
        fieldH.right = fieldG.id;
        fieldG.right = fieldF.id;
        fieldF.right = fieldE.id;
        fieldE.right = fieldD.id;
        fieldD.right = fieldC.id; // Remove building 7 from middle. Move it to right.
        fieldC.right = fieldB.id;
        fieldB.right = fieldA.id;
        for (let section of this.getRow(fieldH, this.sections)) {
            $('#spot-sections-container').append(this.getSectionView(section));
        }
        // Middle bottom
        let building8 = this.sections.find(x => x.id ===  '491f0424-e1fd-4a11-97fb-09be002e60b5');
        let building8SectionView = this.getSectionView(building8);
        $('#spot-sections-container-middle-bottom').append(building8SectionView);

        // Right top
        let rearShedSection = this.sections.find(x => x.id ===  '734541c3-e863-4b4f-9dd6-2bcf606a691d');
        let rearShedSectionView = this.getSectionView(rearShedSection);
        $('#spot-sections-container-right-top').append(rearShedSectionView);

        // Right middle
        let building7 = this.sections.find(x => x.id === 'ebb0a82e-b8fd-46a3-a4af-f49398f82477');
        building7.right = 'da169b60-6ace-4bd5-a761-dffe1fd79cd6';
        let building6 = this.sections.find(x => x.id === building7.right);
        building6.right = 'e9e24284-d47b-4289-8a01-5281c65dc1fe';
        let building5 = this.sections.find(x => x.id === building6.right);
        building5.right = '4afaffcd-533b-4f57-aabc-772af3d98431';
        let building4 = this.sections.find(x => x.id === building5.right);
        building4.right = '0ea763fb-6271-4dc2-afe4-991a8806ea53';
        let building3 = this.sections.find(x => x.id === building4.right);
        building3.right = '9434a661-dcb3-446e-abd2-270345c7f4c5';
        let building2 = this.sections.find(x => x.id === building3.right);
        building2.right = 'dd3e87ef-0bd2-4c8f-b265-f749fcd2dcc7';
        for (let section of this.getRow(building7, this.sections)) {
            $('#spot-sections-container-right-middle').append(this.getSectionView(section));
        }

        // Right bottom
        let southWalkway = this.sections.find(x => x.id === 'da9c786d-ec9a-4678-a313-60f4e44a05ec');
        let southWalkwaySectionView = this.getSectionView(southWalkway);
        $('#spot-sections-container-right-bottom').append(southWalkwaySectionView);
    }
    async init(user) {
        $('.property-navigation').append(Navigation.getPropertyNav(user, PropertySpotsController.getUrl()));
        $('.spot-edit-btn').hide();
        let self = this;
        let date = Moment();
        let diff = (7 - date.day() + 7) % 7;
        date.add(diff, 'day');
        $('#rental-date').prop('disabled', false).val(date.format('YYYY-MM-DD'));
        new AccountSettingsController().init({}, user, false);
        let dataClient = new DataClient();
        try {
            let promiseResults = await Promise.all([
                dataClient.get('point-of-sale/customer-payment-settings?includeInactiveCustomersWithSpots=true'),
                dataClient.get('point-of-sale/spots'),
                dataClient.get(`point-of-sale/spot-reservations?rentalDate=${encodeURIComponent($('#rental-date').val())}`)
            ]);
            this.customers = promiseResults[0];
            this.spots = promiseResults[1];
            this.spotReservations = promiseResults[2];
        } catch (error) {
            Util.log(error)
            MessageViewController.setRequestErrorMessage(error);
            return;
        }

        let sectionIds = Array.from(new Set(this.spots.map(x => x.section == null ? '' : x.section.id)));
        this.sections = [];
        for (let sectionId of sectionIds) {
            let spotSection = this.spots.find(x => (x.section == null ? '' : x.section.id) === sectionId);
            if (spotSection && spotSection.section) {
                this.sections.push(spotSection.section);
            }
        }
        this.buildMap();
        $('#edit-map-btn').click(() => {
            $('#edit-map-btn').prop('disabled', true);
            $('body').addClass('edit-mode');
        });
        $('#show-balances-btn').click(() => {
            $('#show-balances-btn').prop('disabled', true);
            self.setShowBalances(true);
            self.buildMap();
        });
        $("#rental-date").on('change', async () => {
            try {
                MessageViewController.setMessage('');
                self.spotReservations = await dataClient.get(`point-of-sale/spot-reservations?rentalDate=${encodeURIComponent($('#rental-date').val())}`);
                self.buildMap();
            } catch (error) {
                MessageViewController.setRequestErrorMessage(error);
            }
        });
        $('#show-add-spot-form-btn').click(() => {
            $('#add-spot-form').removeClass('hide');
            MessageViewController.setMessage('');
        });
        $('#add-spot-cancel').click(() => {
            $('#add-spot-form').addClass('hide');
            $('#add-spot-form-input-name').val('');
            $("#add-spot-form-input-section option:first").attr("selected", true);
        });
        $('#add-spot-save').click(async () => {
            let newSpot = {
                id: Util.guid(),
                name: $('#add-spot-form-input-name').val().trim(),
                section: {
                    id: $('#add-spot-form-input-section').val(),
                    name: $('#add-spot-form-input-section option:selected').text()
                }
            };
            $('#add-spot-save').prop('disabled', true);
            try {
                await dataClient.patch('point-of-sale/spot', newSpot);
                self.spots.push(newSpot);
                $('#add-spot-form').addClass('hide');
                $('#add-spot-save').prop('disabled', false);
                $('#add-spot-form-input-name').val('');
                $("#add-spot-form-input-section").val($("#add-spot-form-input-section option:first").val());
                self.buildMap();
                MessageViewController.setMessage('Spot added.', 'alert-success');
            } catch (error) {
                $('#add-spot-save').prop('disabled', false);
                Util.log(error);
            }
        });
        for (let section of this.sections) {
            let sectionOption = $('<option></option>');
            sectionOption.text(section.name);
            sectionOption.val(section.id);
            $('#add-spot-form-input-section').append(sectionOption);
        }

    }
}