import { MongoStore } from "wwebjs-mongo";
import config from "./config";
import { connect, ConnectOptions, Mongoose } from "mongoose";

export let store;
export const connectMongodb = async ():Promise <any | null> => {
  const mongoDBoptions: ConnectOptions ={
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    //useFindAndModify: false,
    //useCreateIndex: true
  }
  try {
    const mongoose = await connect(config.mongoDB.URI, mongoDBoptions);
    store = new MongoStore({ mongoose });
    console.log("Mongodb Conectado to ", mongoose.connection.host );
    return store
  } catch (error) {
    console.log("al intentar conectar Mongodb");    
    console.log(config.mongoDB.URI)
    console.log(error)
    return null;
  }  
}