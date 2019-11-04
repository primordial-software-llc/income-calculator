const Util = require('./util');
exports.initNav = function (target) {
    let root = Util.rootUrl();
    target.append(`<div class="container">
          <div class="container-fluid">
              <a class="tab-nav-item" onclick="window.location='${root}/index.html${window.location.search}';" href="#" title="Budget">
                  <span class="ac-gn-link-text">Budget</span>
              </a>
              <a class="tab-nav-item" onclick="window.location='${root}/pages/budget-calendar.html${window.location.search}';" href="#" title="Budget Calendar">
                  <span class="ac-gn-link-text">Calendar</span>
              </a>
              <a class="tab-nav-item" onclick="window.location='${root}/pages/balance-sheet.html${window.location.search}';" href="#" title="Balance Sheet">
                  <span class="ac-gn-link-text">Balance Sheet</span>
              </a>
              <a class="tab-nav-item" onclick="window.location='${root}/pages/accounts.html${window.location.search}';" href="#" title="Accounts">
                  <span class="ac-gn-link-text">Accounts</span>
              </a>
              <a class="tab-nav-item" onclick="window.location='${root}/pages/prices.html${window.location.search}';" href="#" title="Prices">
                  <span class="ac-gn-link-text">Prices</span>
              </a>
              <a class="tab-nav-item" onclick="window.location='${root}/pages/deposit.html${window.location.search}';" href="#" title="Deposit">
                  <span class="ac-gn-link-text">Deposit</span>
              </a>
              <a class="tab-nav-item" onclick="window.location='${root}/pages/pay-days.html${window.location.search}';" href="#" title="Pay Days">
                  <span class="ac-gn-link-text">Pay Days</span>
              </a>
          </div>
      </div>`);
};
