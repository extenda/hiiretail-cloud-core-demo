import { Router } from 'express';
import {Collection} from '../db/collection';
import * as pug from 'pug';

export const getCollection = Router()
  .get('/collections/:collection', async (req, res) => {
    const collection = new Collection(req.params.collection);
    const data = await collection.getAll()
    res.send(
      pug.renderFile('templates/collection.pug', { name: req.params.collection, collection: data })
    );
  });