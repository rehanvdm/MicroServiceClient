import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as MicroServiceClient from '../../lib/micro_service_client-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new MicroServiceClient.MicroServiceClientStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
