import { AppDataSource } from "./data-source"
import cors from 'cors';
import 'dotenv/config';

import express from "express"
import * as http from "http";
import rateLimit from 'express-rate-limit';
import notificationRouter from './controller/notification';
import postRouter from './controller/post';
import { initSocketIO } from "./socket-connection";


const port = process.env.PORT || 4500;

console.log(http.createServer);
const app = express();
const server = http.createServer(app as any);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
});

initSocketIO(server);

app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/notifications', notificationRouter);
app.use('/posts', postRouter);

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
}).catch(error => console.log(error))

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
})
