const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config()
// var inlineBase64 = require('nodemailer-plugin-inline-base64');

const sendEmailCreateOrder = async (email, orderItems, totalPrice) => {
    // console.log("da vao email")
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_ACCOUNT, // generated ethereal user
            pass: process.env.MAIL_PASSWORD, // generated ethereal password
        },
    });
    // transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }));

    let listItem = '';

    orderItems.forEach((order) => {
        listItem += `<div>
    <div>
      Bạn đã đặt sản phẩm <b>${order.name}</b> với số lượng: <b>${order.amount}</b> và giá là: <b>${order.price} VND</b></div>
      <div>Bên dưới là hình ảnh của sản phẩm</div>
    </div>`

    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT, // sender address
        to: email, // list of receivers
        subject: "Bạn đã đặt hàng tại TKLFashion", // Subject line
        text: "Hello world?", // plain text body
        html: generateOrderEmail(orderItems, totalPrice),

    });
}
const generateOrderEmail = (orderItems, totalPrice) => {
    let htmlContent = '<h2>Cảm ơn bạn đã đặt hàng tại TKLFASHION, sau đây là thông tin đơn hàng</h2>';

    // Chèn logo của cửa hàng
    htmlContent += '<img src="https://firebasestorage.googleapis.com/v0/b/economerce-89f59.appspot.com/o/files%2Flogologin.png?alt=media&token=82ef63bb-cbe1-48be-a1d0-912702ebb63a" style="max-width: 200px; margin-bottom: 20px;">';
    // htmlContent += `<span> Mã đơn hàng: ${item._id}</span>`
    // Bắt đầu bảng
    htmlContent += '<table style="width:100%; border-collapse: collapse;">';
    htmlContent += '<tr>';
    htmlContent += '<th style="border: 1px solid #ddd; padding: 8px;">Ảnh</th>';
    htmlContent += '<th style="border: 1px solid #ddd; padding: 8px;">Tên sản phẩm</th>';
    htmlContent += '<th style="border: 1px solid #ddd; padding: 8px;">Số lượng</th>';
    htmlContent += '<th style="border: 1px solid #ddd; padding: 8px;">Giá tiền</th>';
    htmlContent += '</tr>';

    // Lặp qua từng sản phẩm trong đơn hàng và thêm vào bảng
    orderItems.forEach(item => {
        htmlContent += '<tr>';
        htmlContent += `<td style="border: 1px solid #ddd; padding: 8px;"><img src="${item.image}" alt="Product Image" style="max-width: 100px; height: auto;"></td>`;
        htmlContent += `<td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>`;
        htmlContent += `<td style="border: 1px solid #ddd; padding: 8px;">${item.amount}</td>`;
        htmlContent += `<td style="border: 1px solid #ddd; padding: 8px;">${item.price}</td>`;
        htmlContent += '</tr>';
    });

    // Thêm hàng tổng tiền
    htmlContent += '<tr>';
    htmlContent += `<td colspan="3" style="text-align: right; border: 1px solid #ddd; padding: 8px;">Tổng tiền sau khi giảm giá của bạn là:</td>`;
    htmlContent += `<td style="border: 1px solid #ddd; padding: 8px;">${totalPrice}</td>`;
    htmlContent += '</tr>';

    // Kết thúc bảng
    htmlContent += '</table>';

    return htmlContent;
};
const sendEmailResetPassword = async (email, token) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_ACCOUNT, // your email
                pass: process.env.MAIL_PASSWORD, // your email password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: process.env.MAIL_ACCOUNT, // sender address
            to: email, // list of receivers
            subject: "Password Reset", // Subject line
            text: `Bạn nhận được thông báo này vì bạn (hoặc người khác) đã yêu cầu đặt lại mật khẩu cho tài khoản của mình tại web TKLFashion.
            Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quy trình:\n\n
            ${process.env.URL_CLIENT}/reset-password/${token}\n\n
            Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`
        });

        console.log("Email đã được gửi: %s", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Lỗi xảy ra khi gửi email:", error);
        return { success: false, message: "Không thể gửi email đặt lại mật khẩu." };
    }
}
module.exports = {
    sendEmailCreateOrder,
    sendEmailResetPassword
}