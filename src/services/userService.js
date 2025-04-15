import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    //Check email existd
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }
    //Create data save to database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }
    //Save to database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    //Gửi email xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack: Please verify your email before using our service.'
    const htmlContent = `
      <h3>Here is your verification link</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,</br> - Longnh - </h3>
    `
    //Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    //Return message success
    return pickUser(getNewUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    //check exist account
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
    //Update user status to active
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    const updatedUser = await userModel.update(existUser._id, updateData)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    //check exist account
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your password is incorrect!')
    }
    //tạo token login trả về phía FE
    //tạo thông tin đính kèm trong JWT Token: (_id,email)
    const userInfo = { _id: existUser._id, email: existUser.email }
    //tạo 2 loại token: accessToken, refreshToken
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 //5s
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15 // 15s
      env.REFRESH_TOKEN_LIFE
    )
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify / giai ma cai refresh token xem co hop le khong
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tao accessToken moi
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 giay de test accessToken het han
      env.ACCESS_TOKEN_LIFE // 1 tieng
    )
    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvaterFile) => {
  try {
  // Query User va kiem tra cho chac chan
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOTACCEPTABLE, 'Your account is not active!')

    let updatedUser = {}
    //Change password
    if (reqBody.current_password && reqBody.new_password) {
      //Check old password
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current_password is incorrect!')
      }
      //hash new password
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    }
    else if (userAvaterFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(userAvaterFile.buffer, 'users')
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    }
    else {
      //update Infomation user
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {throw error}
}


export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}