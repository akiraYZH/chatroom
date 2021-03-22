const config = require("../config.json");
module.exports = function (req, res, next) {
    if(process.env.NODE_ENV === config.ENV.DEV) {
        let isPass = false;
        for(let i = 0; i < config.HOST.WHITELIST.length; i++){
            
            (req.headers.origin === config.HOST.WHITELIST[i]) && (isPass = true);
            if(isPass){
                // console.log(config.HOST.WHITELIST[i]);
                res.header('Access-Control-Allow-Origin', req.headers.origin);
                break;
            }
        }
    }
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
}