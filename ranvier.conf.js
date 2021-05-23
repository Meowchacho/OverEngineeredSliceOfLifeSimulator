// reuse the configs in ranvier.json so we don't have to duplicate our settings
const config = require('./ranvier.json');
require('dotenv').config()

// inject our environment variables into the config
config.dataSources.MongoDbArray = {
    require: 'ranvier-mongodb-datasource.MongoDbArrayDatasource',
    config: {
        host: process.env.db_host,
        user: process.env.db_user,
        pass: process.env.db_pass,
        name: process.env.db_name
    }
};

config.dataSources.MongoDbObject = {
    require: 'ranvier-mongodb-datasource.MongoDbObjectDatasource',
    config: {
        host: process.env.db_host,
        user: process.env.db_user,
        pass: process.env.db_pass,
        name: process.env.db_name
    }
};

// export our updated config
module.exports = config;