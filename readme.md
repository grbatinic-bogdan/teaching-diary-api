# Teaching Diary API

Manage time entries for your teaching activities

## Install dependencies

`npm install`

## Add configuration

- Create `config.json` in `server/config/` directory
- Add configuration per environment: `dbName, dbUser, dbPassword, jwtSecret`

Exmaple of config.json
```
{
    "dev": {
        "dbName": "your-db-name",
        "dbUser": "your-db-username",
        "dbPassword": "your-db-password",
        "jwtSecret": "supersecretjwtpassword"
    }
}
```

## Start the server

`node server/server.js`

