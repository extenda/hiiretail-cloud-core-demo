import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { getCollection } from './api/get-collection';
import { receiveIamEvent } from './api/receive-iam-event';
import { json } from 'body-parser';
import { getIndexPage } from './api/get-index-page';


export const app = express()
  .use(json({type: ['application/json', 'application/cloudevents+json']}))
  .use(cors())
  .use(getIndexPage)
  .use(getCollection)
  .use(receiveIamEvent);
