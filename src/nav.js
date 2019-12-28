
export default class Navigation {
    static getNavItemView(url, name) {
        return `<a class="tab-nav-item" href="${url}" title="${name}">
                  <span class="ac-gn-link-text">${name}</span>
              </a>`;
    }
}