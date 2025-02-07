/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from './config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'


const START_SERVER = () => {
  const app = express()

  //Xử lý cors
  app.use(cors(corsOptions))

  //Enable req.body json data
  app.use(express.json())

  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // app.use((err, req, res, next) => {
  //   console.error(err.stack)
  //   res.status(500).send('Something broke!')
  // })

  app.get('/', async (req, res) => {
    // console.log(await GET_DB().listCollections().toArray())
    // process.exit(0)
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Server's ${env.AUTHOR} running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

  //Thực hiện tác vụ cleanup khi đóng server lại
  exitHook(() => {
    console.log('3. Disconnecting')
    CLOSE_DB()
  })
}

// Cách viết 1
//Chỉ khi connect server thành công mới start server lên
// Immediately-invoked / Anonymous Async Functions (IIFE) (Funtion ẩn danh)
(async () => {
  try {
    console.log('1. Connecting to database...')

    await CONNECT_DB()

    console.log('2. Connected to database successfully')

    START_SERVER()
  } catch (error) {
    console.log('Error: ', error)
    process.exit(0)
  }
})()

//Cách viết 2
// console.log('1. Connecting to database...')
// //Chỉ khi connect server thành công mới start server lên
// CONNECT_DB()
//   .then(() => { console.log('2. Connected to database successfully')})
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.log('Error: ', error)
//     process.exit(0)
//   })
