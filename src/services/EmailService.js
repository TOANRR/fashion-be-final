const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config()
// var inlineBase64 = require('nodemailer-plugin-inline-base64');

const sendEmailCreateOrder = async (email, orderItems, totalPrice) => {
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

module.exports = {
    sendEmailCreateOrder
}