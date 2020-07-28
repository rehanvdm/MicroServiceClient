const axios = require('axios');
const Xray = require('../helpers/xray');
const LambdaLog = require('../helpers/lambda_log');
const logger = new LambdaLog();

class ClientEventsV1
{
    constructor(eventBridgeClient, awsXray, eventBusName)
    {
        this.eventBridgeClient = eventBridgeClient;
        this.awsXray = awsXray;
        this.xray = new Xray(awsXray);
        this.eventBusName = eventBusName;
        this.version = ".v1";

        this.source = "microservice.client.prod"+this.version
        this.xraySegmentName = "EVENT_BRIDGE::"+this.source;
    }

    async client_created(clientId, clientName, createdAt)
    {
        let params = {
            Entries: [
                {
                    // Event envelope fields
                    EventBusName: this.eventBusName,
                    Source: this.source,
                    DetailType: 'client_created',
                    Time: new Date(),

                    // Main event body
                    Detail: JSON.stringify({
                        "micro-service-trace-id": logger.getTraceId(),
                        client_id: clientId,
                        name: clientName,
                        person_count: 0,
                        created_at :createdAt
                    })
                }
            ]
        };

        return await this.xray.AsyncSegment(this.xraySegmentName, "person_created",
                        this.eventBridgeClient.putEvents(params).promise(), {"client_id": clientId});
    }


}

module.exports = ClientEventsV1;
