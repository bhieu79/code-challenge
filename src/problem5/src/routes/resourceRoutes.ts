import express from 'express';
import resourceController from '../controllers/resourceController';

const router = express.Router();

// GET /api/resources - Get all resources
router.get('/', resourceController.getAllResources);

// GET /api/resources/:id - Get resource by ID
router.get('/:id', resourceController.getResourceById);

// POST /api/resources - Create new resource
router.post('/', resourceController.createResource);

// PUT /api/resources/:id - Update resource (replace entire resource)
router.put('/:id', resourceController.updateResource);

// PATCH /api/resources/:id - Patch resource (partial update)
router.patch('/:id', resourceController.patchResource);

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', resourceController.deleteResource);

export default router;
