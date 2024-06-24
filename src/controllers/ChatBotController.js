const { WebhookClient } = require("dialogflow-fulfillment");
const productInf = require("./helpers");
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Payload } = require("dialogflow-fulfillment");
const dotenv = require('dotenv');
const Order = require("../models/OrderModel");
const axios = require('axios');
const Product = require("../models/ProductModel");
const url = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';

async function searchCityDistrictWard(cityName, districtName, wardName) {

    // Gửi yêu cầu GET đến URL để lấy dữ liệu
    const response = await axios.get(url);

    // Lấy dữ liệu từ phản hồi
    const data = response.data;
    // console.log(data)
    // Duyệt qua danh sách các tỉnh
    for (const province of data) {
        // Duyệt qua danh sách các quận trong tỉnh
        for (const district of province.Districts) {
            // Duyệt qua danh sách các phường trong quận
            for (const ward of district.Wards) {
                // Kiểm tra xem cặp city, district, ward có thỏa mãn không
                if (province.Name === cityName && district.Name === districtName && ward.Name === wardName) {
                    // console.log("co bo nay")
                    return true; // Nếu có, trả về true
                }
            }
        }
    }

    // Nếu không tìm thấy cặp thỏa mãn, trả về false
    return false;

}
function removeHTMLTags(str) {
    return str.replace(/<[^>]*>/g, '');
}

async function getProductInf(productName, agent) {
    const product = await productInf.getProductByName(productName);

    if (product) {
        let response = `Tên: ${product.name}\n`;
        response += `Loại: ${product.type}\n`;
        response += `Danh mục: ${product.category}\n`;
        response += `Giá: ${product.price} VND\n`;
        response += `Kích thước: ${product.sizes.map(s => `${s.size} (còn ${s.countInStock} sản phẩm )`).join(', ')}\n`;
        response += `Mô tả: ${removeHTMLTags(product.description) || 'Không có'}\n`;
        response += `Giảm giá: ${product.discount || 'Không có'}\n`;
        response += `Đã bán: ${product.selled || 0}`;
        const payload = {
            "richContent": [
                [
                    {
                        "type": "info",
                        "title": `${product.name}`,
                        "subtitle": `${response}`,
                        "image": {
                            "src": {
                                "rawUrl": `${product.images[0]}`
                            }
                        },
                        "actionLink": `${process.env.URL_CLIENT}/product-details/${product._id}`
                    }
                ]
            ]
        }

        agent.add(new Payload(agent.UNSPECIFIED, payload, { rawPayload: true, sendAsMessage: true }))

    } else {
        const similarProduct = await productInf.findSimilarProduct(productName);
        if (similarProduct) {
            agent.context.set({ name: "get_product_infor", lifespan: 5, parameters: { productName: similarProduct.name } });
            const response = ` Bạn có phải đang tìm kiếm mặt hàng ${similarProduct.name} không?`;
            agent.add(response);

        } else {
            const response = `Xin lỗi, tôi không tìm thấy sản phẩm với tên ${productName}.`;
            agent.add(response);

        }
    }
}


const chatBot = async (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    const sessionId = req.body.session.split('/').pop();
    console.log('Session ID from webhook:', sessionId);
    const userId = req.body.originalDetectIntentRequest.payload.userId; // Giả sử userId được gửi trong payload

    console.log('User ID from webhook:', userId);
    async function handleIntent(agent) {

        const intent = agent.intent;
        console.log(intent)


        if (intent === "get_product_infor") {
            const productName = agent.parameters.productName;
            console.log("Sản phẩm:", productName);
            const product = await getProductInf(productName, agent);
            // agent.add(product)
            // agent.add(new Payload(agent.UNSPECIFIED, product, { rawPayload: true, sendAsMessage: true }))
        }
        if (intent === "get_product_infor - yes") {
            // const productName = agent.parameters.productName;
            const context = agent.contexts.find(ctx => ctx.name === 'get_product_infor');
            if (context) {
                const productName = agent.context.get("get_product_infor").parameters['productName'];
                console.log("Sản phẩm:", productName);
                const product = await getProductInf(productName, agent);
            }
            else {
                const response = `Xin lỗi, tôi không hiểu ạ`
                agent.add(response);

            }
            // agent.add(product)
            // agent.add(new Payload(agent.UNSPECIFIED, product, { rawPayload: true, sendAsMessage: true }))
        }
        if (intent === "get_order_infor" || intent === "get_order_infor - custom") {
            if (!userId) {
                const response = `Xin lỗi, quý khách phải đăng nhập để có thể thực hiện chức năng này!`
                agent.add(response);
            }
            else {
                const orderCode = agent.parameters.ordercode;
                console.log(orderCode)
                if (orderCode) {
                    const order = await Order.findOne({ _id: orderCode, user: userId });
                    // console.log(order)

                    if (!order) {
                        agent.add(`Xin lỗi,tôi không thể tìm thấy đơn hàng của quý khách với mã ${orderCode} này.`);
                        return;
                    }
                    else {
                        let response = "Đơn hàng của bạn hiện tại đang ";
                        if (order.isPaid) {
                            response += "đã thanh toán";
                            if (order.paidAt) {
                                const paidDate = new Date(order.paidAt);
                                const formattedPaidDate = `${paidDate.getDate()}/${paidDate.getMonth() + 1}/${paidDate.getFullYear()}`;
                                response += ` vào lúc ${formattedPaidDate}`;
                            }
                        } else {
                            response += "chưa thanh toán";
                        }

                        if (order.deliveryStatus === "not_delivered") {
                            response += ", chưa giao hàng";
                        } else if (order.deliveryStatus === "delivered") {
                            response += ", đã giao hàng";
                        } else if (order.deliveryStatus === "delivering") {
                            response += ", đang giao hàng";
                        }

                        if (order.isCancel) {
                            response += `, đã hủy đơn với lý do: ${order.cancelReason}`;
                        }

                        agent.add(response);
                    }

                }
                else {
                    const response = `vui lòng cho biết mã đơn hàng cần kiểm tra!`
                    agent.add(response);
                }
            }
        }
        if (intent === "get_order_infor - custom - more") {
            if (!userId) {
                const response = `Xin lỗi, quý khách phải đăng nhập để có thể thực hiện chức năng này!`
                agent.add(response);
            }
            else {
                console.log(agent.contexts[1].parameters)
                const orderCode = agent.contexts[1].parameters.ordercode;
                console.log(orderCode)
                if (orderCode) {
                    const order = await Order.findOne({ _id: orderCode, user: userId });
                    // console.log(order)

                    if (!order) {
                        agent.add(`Xin lỗi,tôi không thể tìm thấy đơn hàng của quý khách với mã ${orderCode} này.`);
                        return;
                    }
                    else {

                        if (order.deliveryStatus != 'not_delivered') {
                            let response = "Đơn hàng của bạn đã được vận chuyển, không thể sửa đổi thông tin lúc này!";
                            agent.add(response);
                        }
                        else {
                            let response = `Để thực hiện thay đổi địa chỉ giao hàng, bạn hãy nhập tin nhắn theo cú pháp sau:\n
                             Địa chỉ: <tên thành phố/tỉnh>,<huyện/quận/thị xã>,<xã/phường>, <địa chỉ/số nhà cụ thể>\n
                             sau đây là ví dụ mẫu:\n
                             Thành phố Hà Nội, Quận Hai Bà Trưng, Phường Nguyễn Du, số nhà 27\n
                             `;
                            agent.add(response);
                        }


                    }

                }
                else {
                    const response = `vui lòng cho biết mã đơn hàng cần kiểm tra!`
                    agent.add(response);
                }
            }
        }
        if (intent === "get_order_infor - custom - more - next") {
            if (!userId) {
                const response = `Xin lỗi, quý khách phải đăng nhập để có thể thực hiện chức năng này!`
                agent.add(response);
            }
            else {
                console.log(agent.contexts)
                const orderCode = agent.contexts[1].parameters.ordercode;
                console.log(orderCode)
                if (orderCode) {
                    const order = await Order.findOne({ _id: orderCode, user: userId });
                    // console.log(order)

                    if (!order) {
                        agent.add(`Xin lỗi,tôi không thể tìm thấy đơn hàng của quý khách với mã ${orderCode} này.`);
                        return;
                    }
                    else {

                        const city = agent.parameters.city;
                        const district = agent.parameters.district;
                        const ward = agent.parameters.ward;
                        const address = agent.parameters.address;
                        console.log(city, district, ward, address)
                        const res = await searchCityDistrictWard(city, district, ward)
                        // console.log("true", res)
                        if (res === true && address) {
                            order.shippingAddress.city = city;
                            order.shippingAddress.district = district;
                            order.shippingAddress.ward = ward;
                            order.shippingAddress.address = address;

                            // Lưu lại thông tin đơn hàng đã cập nhật vào cơ sở dữ liệu
                            await order.save();
                            agent.add(`cập nhật thành công! Quý khách vui lòng kiểm tra lại đơn hàng`);
                        }
                        else {
                            agent.add(`Địa chỉ của quý khách không đúng với dữ liệu địa lý thực tế, yêu cầu cập nhật lại địa chỉ đã bị hủy!`);
                        }


                    }

                }
                else {
                    const response = `Xin lỗi, tôi có thể giúp gì cho quý khách ạ!`
                    agent.add(response);
                }
            }
        }
        if (intent === "change_address_order") {
            if (!userId) {
                const response = `Xin lỗi, quý khách phải đăng nhập để có thể thực hiện chức năng này!`
                agent.add(response);
            }
            else {
                const response = `Vui lòng cho biết mã đơn hàng`
                agent.add(response);
            }
        }
        if (intent === "change_address_order - next") {
            if (!userId) {
                const response = `Xin lỗi, quý khách phải đăng nhập để có thể thực hiện chức năng này!`
                agent.add(response);
            }
            else {
                const orderCode = agent.parameters.ordercode;
                if (orderCode) {
                    const order = await Order.findOne({ _id: orderCode, user: userId });
                    // console.log(order)

                    if (!order) {
                        agent.add(`Xin lỗi, tôi không thể tìm thấy đơn hàng của quý khách với mã ${orderCode} này.`);
                        return;
                    }
                    else {
                        if (order.deliveryStatus != 'not_delivered') {
                            agent.add(`Xin lỗi, đơn hàng với mã ${orderCode} này đã được vận chuyển, quý khách vui lòng gọi đến số 1900 865 của thương hiệu TKLFashion để giải quyết.`);
                            return;
                        }
                        else {
                            let response = `Để thực hiện thay đổi địa chỉ giao hàng, bạn hãy nhập tin nhắn theo cú pháp sau:\n
                             Địa chỉ: <tên thành phố/tỉnh>,<huyện/quận/thị xã>,<xã/phường>, <địa chỉ/số nhà cụ thể>\n
                             sau đây là ví dụ mẫu:\n
                             Thành phố Hà Nội, Quận Hai Bà Trưng, Phường Nguyễn Du, số nhà 27\n
                             `;
                            agent.add(response);
                        }
                    }
                }
            }
        }

        if (intent === "change_address_order - next - add") {
            if (!userId) {
                const response = `Xin lỗi, quý khách phải đăng nhập để có thể thực hiện chức năng này!`
                agent.add(response);
            }
            else console.log(agent.contexts)
            const orderCode = agent.contexts[0].parameters.ordercode;
            console.log(orderCode)
            if (orderCode) {
                const order = await Order.findOne({ _id: orderCode, user: userId });
                // console.log(order)

                if (!order) {
                    agent.add(`Xin lỗi,tôi không thể tìm thấy đơn hàng của quý khách với mã ${orderCode} này.`);
                    return;
                }
                else {

                    const city = agent.parameters.city;
                    const district = agent.parameters.district;
                    const ward = agent.parameters.ward;
                    const address = agent.parameters.address;
                    console.log(city, district, ward, address)

                    const res = await searchCityDistrictWard(city, district, ward)
                    // console.log("true", res)
                    if (res === true && address) {
                        order.shippingAddress.city = city;
                        order.shippingAddress.district = district;
                        order.shippingAddress.ward = ward;
                        order.shippingAddress.address = address;

                        // Lưu lại thông tin đơn hàng đã cập nhật vào cơ sở dữ liệu
                        await order.save();
                        agent.add(`cập nhật thành công! Quý khách vui lòng kiểm tra lại đơn hàng`);
                    }
                    else {
                        agent.add(`Địa chỉ của quý khách không đúng với dữ liệu địa lý thực tế hoặc bị thiếu, yêu cầu cập nhật lại địa chỉ của quý khách đã bị hủy!`);
                    }


                }

            }
            else {
                const response = `Xin lỗi, tôi có thể giúp gì cho quý khách ạ!`
                agent.add(response);
            }
        }
        if (intent === "suggest_product") {

            let type = agent.parameters.type;
            if (type === "nam") type = "men";
            if (type === "nữ") type = "women";
            if (type === "bé") type = "kids";
            const name = agent.parameters.productname;
            console.log(type, name);

            let query = {};
            let sort = {};
            if (type && name) {
                query = {
                    $text: { $search: name },
                    type: type
                };
                sort = { score: { $meta: "textScore" } };
            } else if (type) {
                query = { type: type };
            } else if (name) {
                query = { $text: { $search: name } };
                sort = { score: { $meta: "textScore" } };
            }

            let products;
            if (Object.keys(query).length === 0) {
                // No specific query, fetch the 5 latest products
                products = await Product.find().sort({ createdAt: -1 }).limit(5);
            } else {
                // Fetch products based on the query with a limit of 5 and sorting by relevance if applicable
                products = await Product.find(query).sort(sort).limit(5);
            }
            console.log(products)
            if (products.length > 0) {

                let richContent = [];
                const intro = 'Sau đây là 1 vài sản phẩm mới nhất của chúng tôi có thể phù hợp với yêu cầu của bạn';

                products.forEach(product => {
                    let response = `Tên: ${product.name}\n`;
                    response += `Loại: ${product.type}\n`;
                    response += `Danh mục: ${product.category}\n`;
                    response += `Giá: ${product.price} VND\n`;
                    response += `Kích thước: ${product.sizes.map(s => `${s.size} (còn ${s.countInStock} sản phẩm )`).join(', ')}\n`;
                    let productInfo = {
                        type: "info",
                        title: `${product.name}`,
                        subtitle: response,
                        image: {
                            src: {
                                rawUrl: `${product.images[0]}`
                            }
                        },
                        actionLink: `${process.env.URL_CLIENT}/product-details/${product._id}`
                    };
                    richContent.push([productInfo]);
                });

                const payload = {
                    richContent: richContent
                };
                agent.add(intro);
                agent.add(new Payload(agent.UNSPECIFIED, payload, { sendAsMessage: true, rawPayload: true }));
            } else {
                const response = 'Xin lỗi, không tìm được sản phẩm phù hợp với mong muốn của quý khách.';
                agent.add(response);
            }
        }

    }

    const intentMap = new Map();
    intentMap.set("take order", handleIntent);
    intentMap.set("Default Welcome Intent", handleIntent);
    intentMap.set("get_product_infor", handleIntent);
    intentMap.set("get_product_infor - yes", handleIntent);
    intentMap.set("get_order_infor", handleIntent);
    intentMap.set("get_order_infor - custom", handleIntent);
    intentMap.set("get_order_infor - custom - more", handleIntent);
    intentMap.set("get_order_infor - custom - more - next", handleIntent);
    intentMap.set("change_address_order", handleIntent);
    intentMap.set("change_address_order - next", handleIntent);
    intentMap.set("change_address_order - next - add", handleIntent);
    intentMap.set("suggest_product", handleIntent);

    agent.handleRequest(intentMap);

}
module.exports = {
    chatBot

}