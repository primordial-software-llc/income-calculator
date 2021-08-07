export default class CustomerDescription {
    static getCustomerDescription(customer) {
        let description = '';

        if (customer.hasOwnProperty("isActive") &&
            customer.isActive !== null &&
            !customer.isActive) {
            description += `*Deleted* `;
        }

        description += customer.displayName || '';
        let fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
        if (fullName && fullName.toLowerCase() !== customer.displayName.toLowerCase()) {
            description += ' : ' + fullName;
        }

        if (customer.hasOwnProperty("isActive") &&
            customer.isActive !== null &&
            !customer.isActive &&
            !customer.displayName) {
            description = description.trim();
            description += ` vendor with QuickBooks Online Id ${customer.quickBooksOnlineId} and website id ${customer.id}`;
        }
        
        return description;
    }
}