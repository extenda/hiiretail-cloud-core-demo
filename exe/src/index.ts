import dotenv from 'dotenv'
dotenv.config();

import {app} from './app';
import {config} from './config';

app.listen(config.port, () => {
  console.log('app is listening on', config.port);
});