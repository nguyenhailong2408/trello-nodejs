import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from '~/routes/v1/boardRoute'
import { columnRoute } from '~/routes/v1/columnRoute'
import { cardRoute } from '~/routes/v1/cardRoute'
import { userRoute } from '~/routes/v1/userRoute'
import { invitationRoute } from '~/routes/v1/invitationRoute'

const Router = express.Router()
//Check APIs V1
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message:'APIs V1 are ready to use' })
})

//Board APIs
Router.use('/boards', boardRouter)
//Column APIs
Router.use('/columns', columnRoute)
//Card APIs
Router.use('/cards', cardRoute)
//User APIs
Router.use('/users', userRoute)
//Invitation APIs
Router.use('/invitations', invitationRoute)

//Kiểu này phải import kiểu object destructuring
export const APIs_V1 = Router
//Kiểu này phải import kiểu đích danh tên và có thể tùy biến tên
// export default Router