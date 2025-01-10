const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const tradeDataController = require('../controllers/tradedata.controller');
const verifyToken = require('../utils/verifyUser');
const router = express.Router();

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query['x-api-key'];
    const validApiKey = 'sachins_data';

    if (!apiKey) {
        return res.status(403).send({ message: 'API key is missing.' });
    }
    if (apiKey !== validApiKey) {
        return res.status(401).send({ message: 'Invalid API key.' });
    }
    next();
};


router.post('/', tradeDataController.save);
router.get('/', tradeDataController.index);
router.get('/info',verifyApiKey, tradeDataController.index);
router.get('/info/:account_number',verifyApiKey, tradeDataController.tradeDataByAccount);
router.get('/getByUserId/:account_number', tradeDataController.tradeDataByAccount);
router.get('/:id', verifyToken, tradeDataController.show);
router.patch('/:id', verifyToken, tradeDataController.update);
router.delete('/delete/:id', verifyToken, tradeDataController.destroy);
router.delete('/deleteAll', tradeDataController.destroyAll);

module.exports = router;