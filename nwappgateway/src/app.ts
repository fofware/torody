import express, { Router } from 'express';
import path from 'path';
import fs from 'fs';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import passportMiddelware from './middlewares/passport';
import config from './config';
import { corsWhiteList } from './middlewares/whitelistcors';
import { initAllWapp } from './wappgateway';

const app = express();
const router:Router = Router();

if(config.public)
  app.use(express.static(path.join(__dirname,config.public)));
app.use('/media',express.static(path.join(__dirname,'/../mediaReceive')))
app.use(morgan('common'));

app.use(cors(
  {
    origin: '*'
  }));

//app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
app.use( corsWhiteList )
app.use(passport.initialize());
//passport.use(passportMiddelware);
/**
 * Rutas
 */
router.get('/', (req, res) => {
  res.sendFile(__dirname + '/../html/index.html');
});

app.use(router);
app.disable('etag');

export default app;
