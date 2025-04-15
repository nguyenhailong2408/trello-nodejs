import { RequestContactExport } from '@getbrevo/brevo'
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error) //Cái này sẽ trả về ở phần lỗi tập trung
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount (req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    // xử lý trả về http only cookie cho phía trình duyệt
    //cookie: https://expressjs.com/en/api.html
    //format time to ms: https://www.npmjs.com/package/ms
    res.cookie('accessToken', result.accessToken, {
      httpOnly:true,
      secure:true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly:true,
      secure:true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
  // Xoa cookie - don gian la lam nguoc lai so voi viec gan cookie a ham login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly:true,
      secure:true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token)'))
  }
}

const update = async (req, res, next) => {
  try {
    // console.log('userController => update request: ', res)
    const userId = req.jwtDecoded._id
    const userAvaterFile = req.file
    const updatedUser = await userService.update(userId, req.body, userAvaterFile)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}


export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}