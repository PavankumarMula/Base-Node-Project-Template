const express = require('express');
const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const {scheduleCron} = require("./utils/chron")

const app = express();

// use app.use instead of express.use
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`✅ Successfully started the server on PORT: ${ServerConfig.PORT}`);
    scheduleCron();
});
