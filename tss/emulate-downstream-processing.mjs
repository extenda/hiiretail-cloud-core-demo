import { PubSub } from "@google-cloud/pubsub";
import { setTimeout } from "node:timers/promises";
import { randomUUID } from "node:crypto";

const client = new PubSub({
  projectId: 'cloud-core-staging-4c71'
});

const inputTopic = client.topic('tss.public.notification.tasks.triggered');
const outputTopic = client.topic('tss.public.notification.tasks.progress');

const subscription = inputTopic.subscription('downstream-processing-demo');

const FAIL_PROCESSING = false; // Set to true to simulate processing failure

async function recreateSubscription() {
  try {
    await subscription.create();
  } catch (error) {
    if (error.code === 6) { // Already exists
      console.log('Subscription already exists, deleting and recreating...');
      await subscription.delete();
      await subscription.create();
      console.log('Subscription deleted.');
    } else {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
}

async function listen() {
  await recreateSubscription();
  console.log('Listening for messages on', subscription.name);

  subscription.on('message', async (message) => {
    const data = JSON.parse(message.data.toString());
    console.log('Received task:', data.id);

    if (data.taskType !== 'demo') {
      console.log('Skipping task:', data.id, 'as it is not of type "demo"');
      message.ack();
      return;
    }

    const attributes = message.attributes;

    const startMessage = {
      id: randomUUID(),
      taskId: data.id,
      component: 'demo.entity',
      type: 'COMPONENT_STARTED',
      timestamp: new Date().getTime(),
      message: 'Task started successfully',
    };
    await outputTopic.publishMessage({
      json: startMessage,
      attributes,
    })
    console.log('Published start message for task:', data.id);

    await setTimeout(10000); // Simulate processing time

    // TODO: For future usage
    // const progressMessage = {}
    // await outputTopic.publishMessage({
    //   json: progressMessage,
    //   attributes,
    // });
    // console.log('Published progress message for task:', data.id);

    const endMessage = {
      id: randomUUID(),
      taskId: data.id,
      component: 'demo.entity',
      type: FAIL_PROCESSING ? 'COMPONENT_FAIL' : 'COMPONENT_SUCCESS',
      timestamp: new Date().getTime(),
      message: 'Task completed successfully',
    };
    await outputTopic.publishMessage({
      json: endMessage,
      attributes,
    });
    console.log('Published end message for task:', data.id);

    message.ack();
  });
}

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await subscription.close();
  console.log('Subscription closed.');
  await subscription.delete();
  console.log('Subscription deleted.');
});

await listen();
