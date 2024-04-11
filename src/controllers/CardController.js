const CardService = require('../services/CardService')

const createCard = async (req, res) => {
    try {

        const response = await CardService.createCard(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const deleteCard = async (req, res) => {
    try {
        console.log(req.body)
        const response = await CardService.deleteCard(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
const getAllItems = async (req, res) => {
    try {
        const user = req.params.id
        const response = await CardService.getAllItems(user)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

module.exports = {
    createCard, deleteCard, getAllItems

}