const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const tradeDataController = require('../controllers/todaystrade.controller');
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

router.post('/', verifyApiKey, tradeDataController.save); // Add API key verification to POST
router.get('/', verifyToken, tradeDataController.index);
router.get('/info', verifyApiKey, tradeDataController.index);
router.get('/:id', verifyToken, tradeDataController.show);
router.patch('/:id', verifyToken, tradeDataController.update);
router.delete('/delete/:id', verifyToken, tradeDataController.destroy);
router.delete('/deleteAll', verifyToken, tradeDataController.destroyAll);

module.exports = router;
