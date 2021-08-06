export default class CustomerDescription {
    static getCustomerDescription(customer) {

        if (customer.id === 'bc9ead41-4601-4021-8f32-63e71f8ee9b6') {
            console.log('break here');
        }

        if (customer.hasOwnProperty("isActive") &&
            customer.isActive !== null &&
            !customer.isActive) {
            return `Deleted vendor with QuickBooks Online Id ${customer.quickBooksOnlineId} and website id ${customer.id}`;
        }

        let description = customer.displayName;
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName && fullName.toLowerCase() !== customer.displayName.toLowerCase()) {
            description += ' : ' + fullName;
        }
        return description;
    }
}