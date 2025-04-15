import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  //Lấy accesstoken trên cookie
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    next(new ApiError (StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }
  try {
    //Giải mã token và check xem có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    //lưu thông tin giải mã được
    req.jwtDecoded = accessTokenDecoded
    //Cho phép request đi tiếp
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError (StatusCodes.GONE, 'Need to refresh token'))
      return
    }

    next(new ApiError (StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}