/*
    Add this html element where you would like the messages to appear.
    <div id="messageAlert" class="hide alert" role="alert"></div>
 */
export default class MessageViewController {
    static setMessage(message, messageType, isSingleHtmlMessage) {
        $('#messageAlert').removeClass('alert-danger');
        $('#messageAlert').removeClass('alert-info');
        $('#messageAlert').removeClass('alert-success');
        $('#messageAlert').addClass(messageType);
        message = message || '';
        if (Array.isArray(message)) {
            for (let messageItem of message) {
                console.log(messageItem);
                $('#messageAlert').append($(`<div>&bull;&nbsp;${messageItem}</div>`));
            }
        } else {
            if (isSingleHtmlMessage) {
                $('#messageAlert').html(message); // Only use this for static text.
            } else {
                $('#messageAlert').text(message);
            }
        }
        if (message.length < 1) {
            $('#messageAlert').addClass('hide');
        } else {
            $('#messageAlert')[0].scrollIntoView();
            $('#messageAlert').removeClass('hide');
        }
    }
}