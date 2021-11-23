# EXE Demo

This is a demo that showcases using the External Event service to set up a webhook. It implements a simple server code that:
* receives events from the IAM;
* parses authorization token and verifies the signature if needed;
* saves the data to a local JSON database for visualisation.

***This is meant to be a showcase code and is intended to run locally. You can use services like Ngrok to proxy data from web.***

## Installation
```shell
npm run i

# copy the contents of example.env to .env in your root and start the server
npm start
```

