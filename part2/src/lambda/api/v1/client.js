const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const LambdaError = require('../_common/helpers/lambda_errors');
const LambdaLog = require('../_common/helpers/lambda_log');
const logger = new LambdaLog();

const client = require('../_common/data_schema/client.js');
const DynamoClient = require('../_common/dynamo/Client.js');

const ClientEventsV1 = require('../_common/event_bridge/client-events-v1');

const ApiBaseClass = require('./ApiBaseClass');
class Client extends ApiBaseClass
{
    constructor(aws, awsXray)
    {
        super();

        this.dynamo = new aws.DynamoDB({apiVersion: '2012-08-10', maxRetries: 6, retryDelayOptions: { base: 50} });
        this.eventbridge = new aws.EventBridge();

        this.dynClient = new DynamoClient(this.dynamo, process.env.DYNAMO_TABLE);
        this.clientEventsV1 = new ClientEventsV1(this.eventbridge, awsXray, "default");
    }

    async create(authUser, body)
    {
        if(!body.data.name || body.data.name.length > 50)
            throw new LambdaError.ValidationError("Field: name is required and can not be longer than 50 characters");

        let now = moment().utc().format("YYYY-MM-DD HH:mm:ss.SSS");
        let newClient = new client(uuidv4(), body.data.name, 0, now);

        await this.dynClient.Put(newClient);

        await this.clientEventsV1.client_created(newClient.client_id, newClient.name);

        return this.MethodReturn(newClient);
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
