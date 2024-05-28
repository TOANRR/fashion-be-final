const { WebhookClient } = require("dialogflow-fulfillment");
const productInf = require("./helpers");
const { Card, Suggestion } = require('dialogflow-fulfillment');
const { Payload } = require("dialogflow-fulfillment");
const dotenv = require('dotenv');

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
                        "actionLink": `${process.env.URL_CLIENT}`
                    }
                ]
            ]
        }

        agent.add(new Payload(agent.UNSPECIFIED, payload, { rawPayload: true, sendAsMessage: true }))

    } else {
        const similarProduct = await productInf.findSimilarProduct(productName);
        if (similarProduct) {
            agent.context.set({ name: "get_product_infor", lifespan: 5, parameters: { productName: similarProduct.name } });
            const response = `Xin lỗi, tôi không tìm thấy sản phẩm với tên ${productName}. Bạn có phải đang tìm kiếm mặt hàng ${similarProduct.name} không?`;
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
        const item = agent.contexts[0].parameters.item;
        const quantity = agent.contexts[0].parameters.number;
        // const billingAmount = getPrice(intent, item, quantity);
        if (intent === "take order") {
            const response = `Great! Your ${quantity} ${item} and cookies will be ready in no time. Please pay 2$.`

        }
        if (intent === "Default Welcome Intent") {
            const response = `Vâng, xin chào bạn ạ`
            agent.add(response);

        }

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


    }

    const intentMap = new Map();
    intentMap.set("take order", handleIntent);
    intentMap.set("Default Welcome Intent", handleIntent);
    intentMap.set("get_product_infor", handleIntent);
    intentMap.set("get_product_infor - yes", handleIntent);
    agent.handleRequest(intentMap);

}
module.exports = {
    chatBot

}