export default class FooterView {
    static getLoadingIndicatorView() {
        return `<div class="loader-container loader-group hide modal fade in" role="dialog" style="display: block; padding-right: 17px;">
              <div class="modal-dialog">
                <div class="loader"></div>
              </div>
          </div>
        <div class="loader-group hide modal-backdrop fade in"></div>`;
    }
    static getView() {
        return `
        <div class="imago-footer-public imago-bg-blue text-center">
            <div class="footer-text-group">
                Contact us at Support@Primordial-software.com
            </div>
            <div class="footer-text-group">
                Copyright 2019-2021 &copy; All Rights Reserved | Primordial Software, LLC | 7602 BLUE IRIS LANE TAMPA, FL 33619
            </div>
            <div class="footer-text-group">
                By viewing this site you agree to our
                <a target="_blank" href="https://www.primordial-software.com/src/LICENSE.txt">license</a>
            </div>
        </div>
        <div class="authenticated-sitemap-footer"></div>
        <div id="account-settings-container">
            <div class="modal fade" id="account-settings-view" role="dialog">
              <div class="modal-dialog">
                  <div class="modal-content">
                      <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal">&times;</button>
                          <h2 class="modal-title">Profile</h2>
                      </div>
                      <div class="modal-body">
                          <form>
                              <div class="form-group">
                                  <label for="account-settings-view-cognito-user">Email</label>
                                  <div id="account-settings-view-cognito-user"></div>
                              </div>
                              <div class="form-group">
                                  <label for="account-settings-view-first-name">First Name</label>
                                  <div id="account-settings-view-first-name"></div>
                              </div>
                              <div class="form-group">
                                  <label for="account-settings-view-last-name">Last Name</label>
                                  <div id="account-settings-view-last-name"></div>
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
          </div>
        </div>
        <div id="raw-data-container">
            <div class="modal fade" id="raw-data-view" role="dialog">
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
            </div>
        </div>
        <div id="debug-console" class="no-print"></div>`;
    }
}