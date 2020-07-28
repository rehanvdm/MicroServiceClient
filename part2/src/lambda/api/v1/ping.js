const ApiBaseClass = require('./ApiBaseClass');
const LambdaResponse = require('../_common/helpers/lambda_response');

class PingPong extends ApiBaseClass
{
    constructor(aws, awsXray)
    {
        super(aws, awsXray);
    }

    async pong(authUser, reqBody)
    {
        return this.MethodReturn("Pong");
    }
}

module.exports = PingPong;
