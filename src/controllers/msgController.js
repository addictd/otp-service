
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

export const addSubscriber = async (req, res, next) => {
    const { endpoint } = req.body;
    try {
        if (!endpoint) throw errMsg.INVALID_PARAMS;
        //validate endpoint to be mobile number;
        const _response = await snsService.addSmsSubscriber({ endpoint });
        return res.json({ status: true, data: _response, msg: "Successfully subscribed." });
    } catch (err) {
        return res.json({ status: false, data: {}, err, msg: "Unable to subscribe." })
    }
}

export const sendSms = async (req, res, next) => {
    const { message_body, phone, type } = req.body;
    try {
        if (!message_body || !phone || !type) throw errMsg.INVALID_PARAMS;
        if (type === "unknown") { // sms is sent to new unknown people

            const _response = await snsService.sendSMS({ message, phone, type });
            return res.json({ status: true, data: {}, msg: "Sms sent successfully." });
        }else if(type === "known"){

        }
        // const _response = await snsService.sendSMS({ message, phone });
        // return res.json({ status: true, data: {}, msg: "Sms sent successfully." });
    } catch (err) {
        return res.json({ status: false, data: {}, err, msg: "Unable to send sms." });
    }
}