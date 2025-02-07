import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from './boardRoute'
import { columnRouter } from './columnRoute'
import { cardRouter } from './cardRoute'

const Router = express.Router()
//Check APIs V1
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message:'APIs V1 are ready to use' })
})

//Board APIs
Router.use('/boards', boardRouter)
//Column APIs
Router.use('/columns', columnRouter)
//Card APIs
Router.use('/cards', cardRouter)

//Kiểu này phải import kiểu object destructuring
export const APIs_V1 = Router
//Kiểu này phải import kiểu đích danh tên và có thể tùy biến tên
// export default Router