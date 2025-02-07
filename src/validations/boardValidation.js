import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { BOARD_TYPES } from '~/utils/constants'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    //custom message
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 chars',
      'string.max': 'Title max 50 chars',
      'string.trim':'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(50).trim().strict(),
    type:Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    //set abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly:false })
    //validate dữ liệu hợp lệ thì cho req đi tiếp qua Controller
    next()

    res.status(StatusCodes.CREATED).json({ message:'POST from validation: APIs create new boards' })
  } catch (error) {
    // console.log(error)
    // console.log(error.message)
    // console.log(new Error(error))

    // const errorMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   errors: new Error(error).message
    // })
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(50).trim().strict(),
    type:Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
  })

  try {
    //set abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    //allowUnknown cho phép không cần đẩy 1 số trường dữ liệu lên
    await correctCondition.validateAsync(req.body, {
      abortEarly:false,
      allowUnknown:true
    })
    next()

    res.status(StatusCodes.CREATED).json({ message:'POST from validation: APIs create new boards' })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    //set abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    //allowUnknown cho phép không cần đẩy 1 số trường dữ liệu lên
    await correctCondition.validateAsync(req.body, { abortEarly:false })
    next()

    res.status(StatusCodes.CREATED).json({ message:'POST from validation: APIs create new boards' })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumn
}