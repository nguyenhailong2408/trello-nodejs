import { StatusCodes } from 'http-status-codes'
// import ApiError from '~/utils/ApiError'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) {
    next(error) //Cái này sẽ trả về ở phần lỗi tập trung
  }
}

export const cardController = {
  createNew
}