const express = require('express');
const router = express.Router();
const {
  getRequests, getKanbanData, getRequest, createRequest, updateRequest, updateStage, deleteRequest, getRequestStats, getCalendarEvents
} = require('../controllers/maintenanceController');

router.get('/kanban', getKanbanData);
router.get('/stats', getRequestStats);
router.get('/calendar', getCalendarEvents);
router.get('/', getRequests);
router.get('/:id', getRequest);
router.post('/', createRequest);
router.put('/:id', updateRequest);
router.patch('/:id/stage', updateStage);
router.delete('/:id', deleteRequest);

module.exports = router;
