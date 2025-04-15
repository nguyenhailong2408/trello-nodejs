//https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken'

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //algorithm không truyền default vẫn là 'HS256'
    return JWT.sign(userInfo, secretSignature, { algorithm:'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}