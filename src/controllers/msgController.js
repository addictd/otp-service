
const fetch = require('node-fetch');
import config from '../../config';

const api_key_sms = config.SMS_2FACTOR_API_KEY;
const def_msg = "Api under construction";
const _url_otp = `https://2factor.in/API/V1/${api_key_sms}`;
const _url_p = `http://2factor.in/API/V1/${api_key_sms}/ADDON_SERVICES`;
import redisService from "../services/redis-service";
import * as errMsg from "../_utils/errMsg";
import snsService from '../services/sns-service';



export const get_otp = async (req, res, next) => {
    const { phone } = req.body;
    try {
        if (!phone) throw errMsg.INCOMPLETE_PARAMS;
        const _response = await snsService.sendOTP({ phone });
        const { otp_id, otp_value, MessageId } = _response;
        const save_to_redis = await redisService.add({ key: otp_id, value: otp_value });
        return res.json({ status: true, data: { MessageId: MessageId, otp_id: otp_id }, msg: "OTP generated successfully." });
    } catch (err) {
        return res.json({ status: false, data: {}, msg: "OTP generation failed.", err: err.toString() });
    }
}

export const verify_otp = async (req, res, next) => {
    const { otp_id, otp } = req.body;
    if (!otp_id || !otp) res.json({ status: false, data: {}, msg: errMsg.INVALID_PARAMS, err: errMsg.INVALID_PARAMS });
    console.log(req.body);
    try {
        const _response = await redisService.get({ key: otp_id });
        if (+_response !== +otp) throw "OTP didn't match.";
        return res.json({ status: true, data: _response, msg: "OTP matched." });
    } catch (err) {
        return res.json({ status: false, err, data: {}, msg: "OTP matched fail." });
    }
}

export const resend_otp = async (req, res, next) => {
    const { otp_id } = req.body;
    if (!otp_id) return res.json({ status: false, msg: errMsg.INVALID_PARAMS, data: {} });
    try {
        const _response = await redisService.get({ key: otp_id });
        return res.json({ status: true, data: _response, msg: "Resent OTP." });
    } catch (err) {
        return res.json({ status: false, err, msg: "Unable to resend OTP" });
    }
}

export const removeSubscriber = async (req, res, next) => {
    let { endpoints } = req.body;
    if (!endpoints) return res.json({ status: false, data: {}, msg: errMsg.INVALID_PARAMS });
    endpoints = endpoints.filter(item => item);
    console.log('endpoints--', endpoints);
    try {
        if (!endpoints && !endpoints.length) throw errMsg.INVALID_PARAMS;

        //validate endpoint to be mobile number;
        // const endpoint = [ "+919650121585", "+919650121585",  "+919650121585",  "+919650121585",  
        // "+919650121585", "+919650121585", "+919650121585", "+919650121585", "+919650121585", "+919650121585","+917398977870" ];
        let unsubscriptionEndpoints = [];
        for (let i = 0; i < endpoints.length; i++) {
            setTimeout(async () => {
                console.log('============', endpoints[i]);
                const _response = await snsService.removeSmsSubscriber({ subscriptionArn: endpoints[i] });
                console.log('========response===', _response);
                unsubscriptionEndpoints.push({
                    subscriptionArn: _response.SubscriptionArn,
                    endpoint: endpoints[i]
                })
                // console.log('response-------', _response);

                if (i === endpoints.length - 1) {
                    return res.json({ status: true, data: unsubscriptionEndpoints, msg: "Successfully unsubscribed." });
                }
            }, 200 * i);
        }

    } catch (err) {
        return res.json({ status: false, data: {}, err, msg: "Unable to subscribe." })
    }
}

export const addSubscriber = async (req, res, next) => {
    let { endpoints } = req.body;
    if (!endpoints) return res.json({ status: false, data: {}, msg: errMsg.INVALID_PARAMS });
    endpoints = endpoints.filter(item => item);
    console.log('endpoints--', endpoints);
    try {


        let subscriptionEndpoints = [];
        for (let i = 0; i < endpoints.length; i++) {
            setTimeout(async () => {
                const _response = await snsService.addSmsSubscriber({ endpoint: endpoints[i] });
                // console.log('response-------', _response);
                subscriptionEndpoints.push({
                    subscriptionArn: _response.SubscriptionArn,
                    endpoint: endpoints[i]
                })
                if (i === endpoints.length - 1) {
                    return res.json({ status: true, data: subscriptionEndpoints, msg: "Successfully subscribed." });
                }
            }, 200 * i);
        }

    } catch (err) {
        return res.json({ status: false, data: {}, err, msg: "Unable to subscribe." })
    }
}

export const sendSms = async (req, res, next) => {
    const { message_body, phone } = req.body;
    try {
        if (!message_body || !phone ) throw errMsg.INVALID_PARAMS;
        
        const _response = await snsService.sendSMS({ message, phone });
        return res.json({ status: true, data: _response, msg: "Sms sent successfully." });
    } catch (err) {
        return res.json({ status: false, data: {}, err, msg: "Unable to send sms." });
    }
}
export const sendBulkSms = async (req, res, next) => {
    const { message_body } = req.body;
    try {
        if (!message_body  ) throw errMsg.INVALID_PARAMS;
        
        const _response = await snsService.sendBulkSMS({ message : message_body });
        return res.json({ status: true, data: _response, msg: "Sms sent successfully." });
    } catch (err) {
        return res.json({ status: false, data: {}, err, msg: "Unable to send sms." });
    }
}