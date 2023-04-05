const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const socketio = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const socketHandler = require('./sockets/socketHandler');

const router = require('./routes/router');

const DB = process.env.DB_URL;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connections successful'));

const app = express();

app.enable('trust proxy');

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketio(server);

app.use('/', router);

socketHandler(io);

server.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});
