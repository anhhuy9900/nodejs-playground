// generateToken.js
const jwt = require("jsonwebtoken");
module.exports = {
    getParams: function (context, events, done) {
        context.vars.token = generateToken();
        const reqParams = getReqParams();
        context.vars.num = reqParams.num;
        context.vars.pId = reqParams.pId;
        return done();
    }
};

function generateToken() {
    const createToken = (payload, secret) => {
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        return token;
    };
    const payload = { userId: 123, username: 'johndoe' };
    const secret = 'jwt-secret';
    const token = createToken(payload, secret);
    return token;
}

function getReqParams() {
    const dataParams = [
        {
            num: 'A123456',
            pId: '970416'
        },
        {
            num: 'BV12345',
            pId: '970438'
        }
    ]

    const random = Math.round(Math.random());
    const reqParams = dataParams[random];
    return reqParams;
}