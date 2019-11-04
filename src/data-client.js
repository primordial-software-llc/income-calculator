const AWS = require('aws-sdk');
const Moment = require('moment');
function DataClient(settings) {
    function getS3Params() {
        return {
            Bucket: settings.s3Bucket,
            Key: settings.s3ObjectKey
        };
    }
    function dataFactory() {
        AWS.config.update(
            {
                accessKeyId: settings.pub,
                secretAccessKey: settings.priv,
                region: 'us-east-1'
            }
        );
        return new AWS.S3();
    }
    this.getData = async function () {
        let response = await dataFactory().getObject(getS3Params()).promise();
        return JSON.parse(response.Body.toString('utf-8'));
    };
    this.patch = async function (name, data) {
        let original = await this.getData();
        let final = Object.assign(original, data);
        if (final.assets) {
            final.assets.sort(function(a, b) {
                if (a.daysToMaturation && b.daysToMaturation) {
                    return Moment(a.issueDate).add(a.daysToMaturation, 'days').valueOf() -
                    Moment(b.issueDate).add(b.daysToMaturation, 'days').valueOf()
                }
                return b.amount - a.amount
            });
        }
        let options = {
            Bucket: settings.s3Bucket,
            Key: name,
            Body: JSON.stringify(final, 0, 4)
        };
        let response = await dataFactory().upload(options).promise();
        return response;
    }
}

module.exports = DataClient;
