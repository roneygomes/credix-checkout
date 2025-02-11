## Description

Simulate a checkout workflow with financing options available for the buyer. The flow is thought to be credit provider agnostic, allowing
the user to proceed with whichever financing scheme makes the most sense.

## Project setup

```bash
$ npm install
```

## Compile and run the project

The application expects a `.env` file at the root directory. It should provide the following vars:
```
CREDIPAY_API_KEY=foo
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=postgres
```

Running the project is as easy as:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Start dependencies and populate the database with docker-compose.
```bash
$ docker-compose up
```


## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

