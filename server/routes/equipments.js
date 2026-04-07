const express = require('express');
const router = express.Router();
const {
  getEquipments, getEquipment, createEquipment, updateEquipment, deleteEquipment, getEquipmentStats
} = require('../controllers/equipmentController');

router.get('/stats', getEquipmentStats);
router.get('/', getEquipments);
router.get('/:id', getEquipment);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

module.exports = router;
