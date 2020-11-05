export default class Password {

    static getPasswordValidationIssues(password) {
        password = password || '';
        let issues = [];
        if (password.length < 1) {
            issues.push('Password is required');
        } else if (password.length < 8) {
            issues.push('Password must be at least 8 characters');
        } if (!new RegExp(/[A-Z]/).test(password)) {
            issues.push('Password must contain at least one uppercase character');
        } else if (!new RegExp(/[a-z]/).test(password)) {
            issues.push('Password must contain at least one lowercase character');
        } else if (!new RegExp(/[0-9]/).test(password)) {
            issues.push('Password must contain at least one number');
        } else if (!new RegExp(/[\.!@#\$%\^&\*\(\)_]/).test(password)) {
            issues.push('Password must contain at least one of the following special characters: .!@#$%^&*()_');
        }
        return issues;
    }

}