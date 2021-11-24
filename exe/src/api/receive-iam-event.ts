import { Router } from 'express';
import { Collection } from '../db/collection';
import { config } from '../config';
import { CloudEvent } from '../@types/cloud-event';
import {RequestData} from '../@types/request-data';
import {parseIamEntityType} from '../util/parse-iam-entity-type';
import {verifyJwt} from '../util/verify-jwt';
import {verifySignature} from '../util/verify-signature';

export const receiveIamEvent = Router()
  .post('/events', async (req, res) => {
    const body: CloudEvent = req.body;

    const type = parseIamEntityType(body.type);

    const token = verifyJwt(req.headers.authorization?.slice('Bearer '.length) as string);

    const requestData: RequestData = {
      id: body.id,
      body,
      headers: req.headers,
      token,
      createdAt: new Date(),
    };

    if (req.headers['x-hii-signature']) {
      requestData.signatureCorrect = verifySignature(
        req.headers['x-hii-signature'].slice('HS256='.length) as string,
        body.data,
        config.secret,
      )
    }

    const collection = new Collection<RequestData>(type === 'none' ? 'default' : type);
    await collection.save(requestData)

    res.status(204).send();
  });