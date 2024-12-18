const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const tradeDataController = require('../controllers/tradedata.controller');
const verifyToken = require('../utils/verifyUser');
const router = express.Router();

router.post('/', verifyToken, tradeDataController.save);
router.get('/', verifyToken, tradeDataController.index);
router.get('/:id', verifyToken, tradeDataController.show);
router.patch('/:id', verifyToken, tradeDataController.update);
router.delete('/:id', verifyToken, tradeDataController.destroy);

module.exports = router;