import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

//Khởi tạo đối tượng ban đầu
let trelloDatabaseInstance = null

//Khởi tạo đối tượng mongoClientInstance để connectDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi:{
    version: ServerApiVersion.v1,
    strict:true,
    deprecationErrors:true
  }
})

export const CONNECT_DB = async () => {
  // Gọi kết nối với mongo Atlas với URI
  await mongoClientInstance.connect()

  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to database first!')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}