const client = require('../data_schema/client');
const BaseClass = require('./BaseClass');
const { v4: uuidv4 } = require('uuid');

class Client extends BaseClass
{
    constructor(dynamoClient, tableName)
    {
        super();

        this.TableName = tableName;
        this.DynamoClient = dynamoClient;
        this.PK = "clients";
    }

    /**
     *
     * @param _client
     * @returns {{SK: *, created_at: *, PK: *, client_id: *, person_count: *}}
     * @constructor
     */
    ToDynamoItem(_client)
    {
        let item = {
                    'PK' : this.GetDynamoValue(this.PK, "string"),
                    'SK' : this.GetDynamoValue(_client.client_id, "string"),
                    'name' : this.GetDynamoValue(_client.name, "string"),
                    'person_count' : this.GetDynamoValue(_client.person_count, "number"),
                    'created_at' : this.GetDynamoValue(_client.created_at, "string"),
                };

        return item;
    }

    /**
     *
     * @param item
     * @returns {client}
     * @constructor
     */
    static FromDynamoItem(item)
    {
        return new client(
                            this.FromDynamoValue(item.SK),
                            this.FromDynamoValue(item.name),
                            this.FromDynamoValue(item.person_count),
                            this.FromDynamoValue(item.created_at)
                          );
    }


    /**
     *
     * @param {client} _client
     * @returns {Promise<{data: boolean}>}
     * @constructor
     */
    async Put(_client)
    {
        var params = {
            TableName: this.TableName,
            Item: this.ToDynamoItem(_client)
        };

        let resp = await this.DynamoClient.putItem(params).promise();
        return this.MethodReturn(true);
    };

    /**
     *
     * @param client_id
     * @returns {Promise<{data: boolean}>}
     * @constructor
     */
    async IncrementPersonCount(client_id)
    {
        let params = {
            TableName: this.TableName,
            Key: {
                'PK' :this.GetDynamoValue(this.PK, "string"),
                'SK': this.GetDynamoValue(client_id)
            },
            UpdateExpression: "SET #person_count = #person_count + :person_count",
            ConditionExpression: 'attribute_exists(SK)',
            ExpressionAttributeNames: {
                "#person_count": "person_count",
            },
            ExpressionAttributeValues: {
                ":person_count": this.GetDynamoValue(1, "number"),
            }
        };

        return this.DynamoClient.updateItem(params).promise();
    };


    /**
     *
     * @param client_id
     * @param consistentRead
     * @returns {Promise<{data: *}>}
     * @constructor
     */
    async Find(client_id, consistentRead = false)
    {
        let params = {
            TableName: this.TableName,
            Key: {
                'PK' :this.GetDynamoValue(this.PK, "string"),
                'SK': this.GetDynamoValue(client_id)
            },
            ReturnConsumedCapacity: "TOTAL",
            ConsistentRead: consistentRead
        };

        let resp = (await this.DynamoClient.getItem(params).promise());
        let item = resp.Item ? Client.FromDynamoItem(resp.Item) : null;
        return this.MethodReturn(item);
    };

    /**
     *
     * @returns {Promise<{data: *}>}
     * @constructor
     */
    async FindFirst(limit)
    {
        let params = {
            TableName: this.TableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk" : this.GetDynamoValue(this.PK, "string")
            },
            Limit: limit,
            ScanIndexForward: false
        };

        let resp =  await this.DynamoClient.query(params).promise();
        let items  = [];

        let respLength = resp.Items.length;
        for(let i = 0; i < respLength; i++)
            items.push(Client.FromDynamoItem(resp.Items[i]));

        return this.MethodReturn( { Items: items } );
    };


}


module.exports = Client;
