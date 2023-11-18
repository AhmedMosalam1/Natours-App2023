const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}



module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `Ahmed Mosalam <${process.env.GMAIL_USERNAME}>`;
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {

      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });




  }




  async send(template, subject) {

    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      filename: this.firstName,
      url: this.url,
      subject
    })


    const mailOptions = {
      from: `Ahmed Mosalam <${process.env.GMAIL_USERNAME}>`,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the Natours Family...")
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Your password reset token (valid for only 10 minutes)");
  }

}




