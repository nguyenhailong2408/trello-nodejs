import { env } from '~/config/environment'

const brevo = require('@getbrevo/brevo')
let defaultClient = brevo.ApiClient.instance
let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async(toEmail, customSubject, htmlContent) => {
  let sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
  sendSmtpEmail.to = [
    { email: toEmail }
  ]
  sendSmtpEmail.subject = customSubject
  sendSmtpEmail.htmlContent = htmlContent

  return apiInstance.sendTransacEmail(sendSmtpEmail)
//   .then(function (data) {
//     console.log('API called successfully. Returned data: ' + JSON.stringify(data))
//   }, function (error) {
//     console.error(error)
//   })
}

export const BrevoProvider = {
  sendEmail
}