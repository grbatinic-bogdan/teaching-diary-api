const Sequelize = require('sequelize');



const {
    dbName,
    dbUser,
    dbPassword
} = process.env;

// connect to db
const sequelize = new Sequelize(dbName, dbUser, dbPassword,
    {
        host: 'localhost',
        dialect: 'mysql',
        operatorsAliases: Sequelize.Op
    }
);

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        throw new Error('Unable to connect to the database');
        // console.error('Unable to connect to the database:', err);
    });

module.exports = {
    sequelize
};
