import Currency from 'currency.js';
import Util from '../util';
function obfuscateViewModel(viewModel) {
    for (let asset of viewModel.assets) {
        if (asset.shares) {
            asset.shares = Currency(asset.shares, Util.getCurrencyDefaults()).multiply(
                Util.obfuscationAmount()
            ).toString();
        }
        if (asset.amount) {
            asset.amount = Currency(asset.amount, Util.getCurrencyDefaults()).multiply(
                Util.obfuscationAmount()
            ).toString();
        }
    }
    for (let debt of viewModel.balances) {
        debt.amount = Currency(debt.amount, Util.getCurrencyDefaults()).multiply(
            Util.obfuscationAmount()
        ).toString();
    }
}
function mergeModels(data, bankData) {
    let viewModel = JSON.parse(JSON.stringify(data));
    viewModel.assets = viewModel.assets || [];
    viewModel.balances = viewModel.balances || [];
    viewModel.failed = bankData.failedAccounts;
    for (let bankAccount of bankData.allAccounts || []) {
        for (let account of bankAccount.accounts.filter(x =>
            x.type !== 'credit' &&
            (
                x.subtype === 'retirement' ||
                x.subtype === '401k' ||
                x.subtype === 'hsa'
            ))) {
            viewModel.assets.push({
                type: 'property-plant-and-equipment',
                name: [bankAccount.item.institution.name, account.subtype, account.mask]
                    .filter(x => x)
                    .join(' - '),
                amount: account.balances.current,
                id: account['account_id'],
                isAuthoritative: true
            });
        }
        for (let account of bankAccount.accounts.filter(x =>
            x.type !== 'credit' &&
            x.subtype !== 'retirement' &&
            x.subtype !== '401k' &&
            x.subtype !== 'hsa')) {
            viewModel.assets.push({
                type: 'cash',
                name: [bankAccount.item.institution.name, account.subtype, account.mask]
                    .filter(x => x)
                    .join(' - '),
                amount: account.balances.available,
                currentBalance: account.balances.current,
                id: account['account_id'],
                isAuthoritative: true
            });
        }
        for (let account of bankAccount.accounts.filter(x => x.type === 'credit')) {
            viewModel.balances.push({
                type: account.type,
                name: `${bankAccount.item.institution.name} - ${account.subtype} - ${account.mask}`,
                amount: account.balances.current,
                isAuthoritative: true
            });
        }
    }
    return viewModel;
}
export default class BalanceSheetViewModel {
    static getViewModel(budget, bankData, obfuscate) {
        let mergedModel = mergeModels(budget, bankData);
        if (obfuscate) {
            obfuscateViewModel(mergedModel);
        }
        return mergedModel;
    }
}