const express = require('express');
const router = express.Router();
const adminAuth = require('../../middleware/adminAuth');
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories
} = require('../../controllers/kudosController');

router.use(adminAuth);

router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
