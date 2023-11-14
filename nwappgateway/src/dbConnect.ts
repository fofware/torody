
import config from "./config";
import { connect, ConnectOptions } from "mongoose";

export const connectMongodb = async () => {
  const mongoDBoptions: ConnectOptions ={
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    //useFindAndModify: false,
    //useCreateIndex: true
  }
  try {
    const db = await connect(config.mongoDB.URI, mongoDBoptions);
    console.log('-------------------------------------------')
    console.log('-------------------------------------------')
    console.log('-------------------------------------------')
    console.log('-------------------------------------------')
    console.log("Mongodb Conectado to ", db.connection.host )    
    console.log('-------------------------------------------')
    console.log('-------------------------------------------')
    console.log('-------------------------------------------')
    console.log('-------------------------------------------')
  } catch (error) {
    console.log("al intentar conectar Mongodb");    
    console.log(config.mongoDB.URI)
    console.log(error)
  }  
}