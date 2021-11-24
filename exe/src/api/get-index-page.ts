import { Router } from 'express';
import * as pug from 'pug';
import { db } from '../db/json-db';
import { config } from '../config';

export const getIndexPage = Router()
  .get('/', async (_req, res) => {
    const collections = Object.keys(db.getData('/'));
    res.send(pug.renderFile('templates/index.pug', {
      collections, url: config.url,
    }));
  });
