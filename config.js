const development = {
    ENV : "DEVELOPMENT",
    PORT : 3700,
    SMS_2FACTOR_API_KEY : '8f3ec54b-c38d-11e9-ade6-0200cd936042',
    // DB_URL : "mongodb+srv://kamal:December_2012@beamer-d-ekxeg.mongodb.net/konfinity-alpha?retryWrites=true"
};
const production = {
    ENV : "PRODUCTION",
    PORT : 80,
    // DB_URL : "mongodb+srv://kamal:December_2012@beamer-d-ekxeg.mongodb.net/konfinity-alpha?retryWrites=true"
};

let env = development;

const ARG = process.argv[2];
const _ARG = ARG.split("=");

if(_ARG[1] === "PRODUCTION"){  env = production; }

console.log('[mode]: ', env.ENV );



module.exports = env;