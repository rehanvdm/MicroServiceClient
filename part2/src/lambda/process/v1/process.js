const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const LambdaError = require('../_common/helpers/lambda_errors');
const LambdaLog = require('../_common/helpers/lambda_log');
const logger = new LambdaLog();

const DynamoClient = require('../_common/dynamo/Client');

const ApiBaseClass = require('./ApiBaseClass');
class Common extends ApiBaseClass
{
    constructor(aws, awsXray)
    {
        super();

        this.snsClient = new aws.SNS({apiVersion: '2010-03-31'});

        this.dynamo = new aws.DynamoDB({apiVersion: '2012-08-10', maxRetries: 6, retryDelayOptions: { base: 50} });
        this.dynClient = new DynamoClient(this.dynamo, process.env.DYNAMO_TABLE);
    }

    async person_created(authUser, body)
    {
        if(!body.data.client_id)
            throw new LambdaError.ValidationError("Field: client_id is required");

        if(!body.data.client_id)
            throw new LambdaError.ValidationError("Field: client_id is required");

        let ret = await this.dynClient.IncrementPersonCount(body.data.client_id)
            .catch(err =>
            {
                if(err.code === "ConditionalCheckFailedException")
                    throw new LambdaError.HandledError("Client does not exist");
            })

        return this.MethodReturn(true);
    };

}

module.exports = Common;
