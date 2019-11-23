const Util = require('./util');
exports.initNav = function (target) {
    let root = Util.rootUrl();
    target.append(`<div class="container">
          <div class="container-fluid">
              <a class="tab-nav-item" href="${root}/index.html" title="Budget">
                  <span class="ac-gn-link-text">Budget</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/budget-calendar.html" title="Budget Calendar">
                  <span class="ac-gn-link-text">Calendar</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/balance-sheet.html" title="Balance Sheet">
                  <span class="ac-gn-link-text">Balance Sheet</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/accounts.html" title="Transfers">
                  <span class="ac-gn-link-text">Transfers</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/deposit.html" title="Deposit">
                  <span class="ac-gn-link-text">Deposit</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/prices.html" title="Prices">
                  <span class="ac-gn-link-text">Prices</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/pay-days.html" title="Pay Days">
                  <span class="ac-gn-link-text">Pay Days</span>
              </a>
              <a class="tab-nav-item" href="${root}/pages/link-bank-account.html" title="View and Manage Linked Banks">
                  <span class="ac-gn-link-text">Banks</span>
              </a>
          </div>
      </div>`);
};
