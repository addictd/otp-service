import { promisify } from "util";
import * as errMsg from "../_utils/errMsg";
import aws from 'aws-sdk';
aws.config.loadFromPath('./aws-config.json');
const sns = new aws.SNS({ apiVersion: '2010-03-31' });


const _topicArn = 'arn:aws:sns:us-east-1:149162652215:dummy-sms'; //for promotional

const sendSMS = async (props, cb) => {
    try {
        const { message, phone, type } = props;
        if (!message || !phone) throw errMsg.INCOMPLETE_PARAMS;
        var params = {
            Message: message,
            PhoneNumber : phone
        };
        sns.publish(params, async (err, data) => {
            if (err) throw err;
            else { return cb(null, data); }
        });
    } catch (err) {
        return cb(err);
    }
}
const sendBulkSMS = async (props, cb) => {
    try {
        const { message } = props;
        if (!message ) throw errMsg.INCOMPLETE_PARAMS;
        var params = {
            Message: message,
            TopicArn : _topicArn
        };
        
        sns.publish(params, async (err, data) => {
            if (err) throw err;
            else { return cb(null, data); }
        });
    } catch (err) {
        return cb(err);
    }
}


const sendOTP = async (props, cb) => {
    try {
        const { phone } = props;
        if (!phone) throw errMsg.INCOMPLETE_PARAMS;
        // validate phone number
        const _otp = generate_otp();
        const message = get_otp_msg(_otp.value);

        var params = {
            Message: message,
            PhoneNumber: phone
        };
        sns.publish(params, async (err, data) => {
            if (err) throw err;
            else {
                data.otp_id = _otp.key;
                data.otp_value = _otp.value;
                return cb(null, data);
            }
        });
    } catch (err) {
        return cb(err);
    }
}

const addSmsSubscriber = (props, cb) => {
    let { protocol, topicArn, endpoint } = props;
    try {
        if (!endpoint) throw errMsg.INCOMPLETE_PARAMS;

        protocol = protocol || "sms";
        topicArn = topicArn || _topicArn;
        var params = {
            Protocol: protocol, /* required */
            TopicArn: topicArn, /* required */
            Endpoint: endpoint,
        };
        sns.subscribe(params, function (err, data) {
            if (err) throw err;
            else {
                // console.log('data======',data);   
                return cb(null, data);
            }
        });
    } catch (err) {
        return cb(err);
    }
}

const removeSmsSubscriber = (props, cb) => {
    console.log('props: ', props);
    let { subscriptionArn } = props;
    try {
        if (!subscriptionArn) throw errMsg.INCOMPLETE_PARAMS;

        var params = {
            SubscriptionArn: subscriptionArn 
        };
        sns.unsubscribe(params, function (err, data) {
            if (err) throw err;
            else{
                return cb(null, data);
            }
        });
    } catch (err) {
        // console.log('err======', err);
        return cb(err);
    }
}

const generate_otp = () => {
    var _random = Math.floor(1000 + Math.random() * 9000);
    var _key = (new Date()).getTime() + _random;
    return { key: _key, value: _random };
}
const get_otp_msg = (otp) => (`KONFINITY.com : OTP is ${otp}`);

const exportObj = {
    sendSMS: promisify(sendSMS),
    sendBulkSMS : promisify(sendBulkSMS),
    addSmsSubscriber: promisify(addSmsSubscriber),
    removeSmsSubscriber: promisify(removeSmsSubscriber),
    sendOTP: promisify(sendOTP)
};

export default exportObj;