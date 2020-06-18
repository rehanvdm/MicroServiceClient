const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const LambdaError = require('../helpers/lambda_errors');
const LambdaLog = require('../helpers/lambda_log');
const logger = new LambdaLog();

const client = require('../data_schema/client.js');
const DynamoClient = require('../dynamo/Client.js');

const ApiBaseClass = require('./ApiBaseClass');
class Client extends ApiBaseClass
{
    constructor(aws)
    {
        super();

        this.dynamo = new aws.DynamoDB({apiVersion: '2012-08-10', maxRetries: 6, retryDelayOptions: { base: 50} });
        this.dynClient = new DynamoClient(this.dynamo, process.env.DYNAMO_TABLE);
    }

    async create(authUser, body)
    {
        if(!body.data.name || body.data.name.length > 50)
            throw new LambdaError.ValidationError("Field: name is required and can not be longer than 50 characters");

        let now = moment().utc().format("YYYY-MM-DD HH:mm:ss.SSS");
        let newClient = new client(uuidv4(), body.data.name, 0, now);

        await this.dynClient.Put(newClient);

        return this.MethodReturn(newClient);
    };

    async increment_person_count(authUser, body)
    {
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

    async find(authUser, body)
    {
        if(!body.data.client_id)
            throw new LambdaError.ValidationError("Field: client_id is required");

        let ret = await this.dynClient.Find(body.data.client_id);

        return this.MethodReturn(ret.data);
    };


    async find_first(authUser, body)
    {
        if(!body.data.limit || body.data.limit > 100)
            throw new LambdaError.ValidationError("Field: limit is required and can not be more than 100");

        let ret = await this.dynClient.FindFirst(body.data.limit);

        return this.MethodReturn(ret.data);
    };



}

module.exports = Client;
