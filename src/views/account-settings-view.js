exports.getCommandButtonsContainerView = (obfuscate) =>
    `<span id="log-out-button" class="command-button" title="log out">
          <span class="glyphicon glyphicon glyphicon-log-out" aria-hidden="true"></span>
      </span>
      <span id="view-raw-data-button" class="command-button" title="view raw json data">
          <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
      </span>
      <span id="account-settings-button" class="command-button" title="settings">
          <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
      </span>
      <span id="budget-download" class="command-button" title="download">
          <span class="glyphicon glyphicon-download" aria-hidden="true"></span>
      </span>
      <span id="obfuscate-data" class="command-button" title="${obfuscate ? 'un-' : ''}obfuscate data">
          <span class="glyphicon glyphicon-eye-${obfuscate ? 'open' : 'close'}" aria-hidden="true"></span>
      </span>`;

exports.getAccountSettingsView = () =>
    `<div class="modal fade" id="account-settings-view" role="dialog">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h2 class="modal-title">Profile</h2>
              </div>
              <div class="modal-body">
                  <form>
                      <div class="form-group">
                          <label for="account-settings-view-cognito-user">User</label>
                          <div id="account-settings-view-cognito-user"></div>
                      </div>
                      <div class="form-group">
                          <label for="account-settings-view-cognito-user">License Agreement</label>
                          <div id="account-settings-view-license-agreement"></div>
                      </div>
                  </form>
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
          </div>
      </div>
  </div>`;

exports.getRawDataView = () =>
    `<div class="modal fade" id="raw-data-view" role="dialog">
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h2 class="modal-title">Raw Data</h2>
              </div>
              <div class="modal-body">
              </div>
              <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
              </div>
          </div>
      </div>
  </div>`;