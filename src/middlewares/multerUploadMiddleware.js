import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '~/utils/validators'

//Check file
const customFileFilter = (req, file, callback) => {
//   console.log('Multer file: ', file)

  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  return callback(null, true)
}

//Khởi tạo function upload được tạo bởi multer
const upload = multer({
  limits:{ fieldSize:LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
  upload
}