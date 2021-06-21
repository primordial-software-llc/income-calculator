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
function getAccountName(bank, account) {
    return [bank.item.institution.name, account.subtype, account.mask || account.name]
        .filter(x => x)
        .join(' - ');
}
function isMortgage(name, type) {
    return name === 'FHAResidential' && type === 'depository';
}
function mergeModels(data, bankData) {
    let viewModel = JSON.parse(JSON.stringify(data));
    viewModel.assets = viewModel.assets || [];
    viewModel.balances = viewModel.balances || [];
    viewModel.failed = bankData.failedAccounts;
    for (let bank of bankData.allAccounts || []) {
        let accountsCopy = JSON.parse(JSON.stringify(bank.accounts));
        let liabilityAccounts = accountsCopy.filter(x => x.type === 'credit' || isMortgage(x.name, x.type));
        let assetAccounts = accountsCopy.filter(x => !liabilityAccounts.includes(x));
        let nonCurrentAccountTypes = ['retirement', '401k', 'hsa', 'ira', 'roth']
        let nonCurrentIncome = assetAccounts.filter(x => nonCurrentAccountTypes.find(y => x.subtype === y));
        let currentIncome = assetAccounts.filter(x =>
            !nonCurrentAccountTypes.find(y => x.subtype === y) && x.subtype !== 'brokerage');
        let brokerageIncome = assetAccounts.filter(x => x.type !== 'credit' && x.subtype === 'brokerage');
        for (let account of brokerageIncome) {
            viewModel.assets.push({
                type: 'cash-or-stock',
                name: getAccountName(bank, account),
                amount: account.balances.current,
                id: account['account_id'],
                isAuthoritative: true
            });
        }
        for (let account of nonCurrentIncome) {
            viewModel.assets.push({
                type: 'non-liquid-stocks-and-bonds',
                name: getAccountName(bank, account),
                amount: account.balances.current,
                id: account['account_id'],
                isAuthoritative: true
            });
        }
        for (let account of currentIncome) {
            viewModel.assets.push({
                type: 'cash',
                name: getAccountName(bank, account),
                amount: account.balances.available,
                currentBalance: account.balances.current,
                id: account['account_id'],
                isAuthoritative: true
            });
        }
        for (let account of liabilityAccounts) {
            let liabilityAmount = account.balances.current;
            if (isMortgage(account.name, account.type)) {
                liabilityAmount = liabilityAmount * -1;
            }
            viewModel.balances.push({
                type: account.type,
                name: getAccountName(bank, account),
                amount: liabilityAmount,
                isAuthoritative: true,
                isCurrent: true
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