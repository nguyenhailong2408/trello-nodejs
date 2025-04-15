import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'
//https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud

const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

//Function upload file to cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise ((resolve, reject) => {
    // Tao mot cai luong stream upload len cloudinary
    const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
    //Thuc hien upload cai luong tren bang lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = { streamUpload }