import { promisify } from "util";
import * as errMsg from "../_utils/errMsg";

var redis = require("redis");
const client = redis.createClient();

client.expire('client', 120);

const add = async (props, cb) => {
    const { key, value } = props;
    if (!key || !value) return cb(errMsg.INCOMPLETE_PARAMS);
    return client.set(key, value, function (err, reply) {
        if (err) return cb(err);
        return cb(null, reply);
    });
}
const get = async (props, cb) => {
    const { key } = props;
    if (!key) return cb(errMsg.INCOMPLETE_PARAMS);
    return client.get(key, function (err, reply) {
        console.log("----------",err, reply)
        if (err) return cb(err);
        return cb(null, reply);
    });
}
const update = async (props, cb) => {

}
const remove = async (props, cb) => {
    return client.del('redisClient', function (err, reply) {
        if (err) return cb(err);
        if (reply === 1) {
            return cb(null, "Key is deleted");
        } else {
            return cb(null, "Does't exists");
        }
    });
}

const exportObj = {
    add: promisify(add),
    get: promisify(get),
    update: promisify(update),
    remove: promisify(remove)
};

export default exportObj;