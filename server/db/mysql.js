const Sequelize = require('sequelize');

// connect to db
const sequelize = new Sequelize('teaching_diary', 'root', null,
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
