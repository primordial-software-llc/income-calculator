export default class PropertyApp {

    isPropertyAppUser(email) {
        return email === 'timg456789@yahoo.com' ||
            email === 'kmanrique506@hotmail.com' ||
            email === 'george.loyola21@gmail.com' ||
            email === 'lizeth.martinez08@gmail.com';
    }

    isAuthorizedToCreateMassInvoices(email) {
        return email === 'timg456789@yahoo.com';
    }

}