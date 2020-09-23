import AccountSettingsController from './account-settings-controller';
import SpotView from '../views/property-spots/spot-view';
import DataClient from '../data-client';
import MessageViewController from './message-view-controller';
import Moment from 'moment/moment';
import Util from '../util';

export default class PropertySpotsController {
    static getName() {
        return 'Spots';
    }
    static getUrl() {
        return `${Util.rootUrl()}/pages/property-spots.html`;
    }
    static hideInNav() {
        return true;
    }
    getVendorWhoReservedSpot(spotId) {
        return this.getIndefiniteSpotReservationVendor(spotId) ||
            this.getOneTimeSpotReservationVendor(spotId);
    }
    getIndefiniteSpotReservationVendor(spotId) {
        return this.customers
            .find(vendor =>
                vendor.spots &&
                vendor.spots.find(spot => spot.id === spotId));
    }
    getOneTimeSpotReservationVendor(spotId) {
        let oneTimeSpotReservation = this.spotReservations.find(x => x.spotId === spotId);
        if (oneTimeSpotReservation) {
            let vendor = this.customers.find(x => x.quickBooksOnlineId === oneTimeSpotReservation.quickBooksOnlineId);
            return vendor;
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
            '16916bcb-cb22-436e-9b77-86697a397a25', // Field A 8
            '5407aaae-46cd-4f69-af83-b9665b644cef', // Field B 8
            '92c4e679-ba81-4753-a5e7-a65b4909c50b', // Field C 8
            '8dc98089-a238-4f98-ace8-b8c8f20b8016', // Field D 8
            '8a1d2523-fe4c-401e-881a-d21f20cd8de7', // Field E 8
            'f898bf04-800f-4711-9b01-cac1a21144f7', // Field F 8
            'b10ccdcc-b4cb-4e36-b30d-393cc7569143', // Field G 8
            'e3820f9e-e4ad-4aa9-8945-1501449ff0ba', // Field H 8 - North Walkway
            '4d14e171-46ff-440b-8ca1-10129a71aba3', // Field I Parking
            'fb6b507f-aae4-44ad-aa96-29aca8b113ca', // Field J Parking
            '4a01797e-25a2-4cb7-91df-78bfd380f5a0', // Field K Parking
            'fb627c18-236d-4263-91e6-aecdfba6d08e'  // Field L Parking
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
            let rowOfSpots = this.getRow(leftSpot, sectionSpots);
            let rowOfSpotsContainer = $(`<div class="spot-row-container"></div>`);
            for (let spot of rowOfSpots) {
                let reservedByVendor = this.getVendorWhoReservedSpot(spot.id);
                let spotView = $(SpotView.getSpotView(spot, reservedByVendor));
                this.initSpotView(spotView, spot, section, sectionSpots);
                rowOfSpotsContainer.append(spotView);
            }
            sectionView.append(rowOfSpotsContainer);
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
            availableBottomSpots.push(sectionSpots.find(x => x.id === spot.bottom));
            bottomIndex = availableBottomSpots.findIndex(x => x.id == spot.bottom) + 1;
        }
        if (spot.right) {
            availableRightSpots.push(sectionSpots.find(x => x.id === spot.right));
            rightIndex = availableRightSpots.findIndex(x => x.id == spot.right) + 1;
        }
        spotView.find('.spot-cancel').click(function() {
            spotView.find('.spot-bottom').prop('selectedIndex', bottomIndex);
            spotView.find('.spot-right').prop('selectedIndex', rightIndex);
            spotView.find('.form').addClass('hide');
        });
        spotView.find('.spot-save').click(async function() {
            let dataClient = new DataClient();
            let patch = {
                id: spot.id,
                bottom: spotView.find('.spot-bottom').val(),
                right: spotView.find('.spot-right').val()
            };
            let updatedSpot = await dataClient.patch('point-of-sale/spot', patch);
            let spotIndex = self.spots.findIndex(x => x.id === updatedSpot.id);
            self.spots[spotIndex] = updatedSpot;
            spotView.find('.form').addClass('hide');
            self.buildMap();
        });
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
    }
    buildMap() {
        $('.spot-sections-container').empty();
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
    }
    async init(user) {
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
                dataClient.get('point-of-sale/customer-payment-settings'),
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
        $('#edit-map-btn').click(function () {
            $('#edit-map-btn').prop('disabled', true);
            $('.spot-sections-container').addClass('edit-mode');
        });
    }
}