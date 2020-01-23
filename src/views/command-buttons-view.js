export default class CommandButtonsView {
    static getCommandButtonsView(obfuscate) {
        return `<span id="log-out-button" class="command-button" title="log out">
          <span class="glyphicon glyphicon glyphicon-log-out" aria-hidden="true"></span>
      </span>
      <span id="view-raw-data-button" class="command-button" title="view raw json data">
          <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
      </span>
      <span id="account-settings-button" class="command-button" title="settings">
          <span class="glyphicon glyphicon-user" aria-hidden="true"></span>
      </span>
      <span id="budget-download" class="command-button" title="download">
          <span class="glyphicon glyphicon-download" aria-hidden="true"></span>
      </span>
      <span id="obfuscate-data" class="command-button" title="${obfuscate ? 'un-' : ''}obfuscate data">
          <span class="glyphicon glyphicon-eye-${obfuscate ? 'open' : 'close'}" aria-hidden="true"></span>
      </span>`;
    }
}