import { Request, Response } from 'express';
import resourceService from '../services/resourceService';
import { ResourceFilters, CreateResourceRequest, UpdateResourceRequest, PatchResourceRequest } from '../types';

class ResourceController {
    
    // GET /api/resources
    async getAllResources(req: Request, res: Response): Promise<void> {
        try {
            const filters: ResourceFilters = {
                category: req.query.category as string,
                status: req.query.status as string,
                search: req.query.search as string
            };

            const result = await resourceService.getAllResources(filters);

            if (!result.success) {
                res.status(500).json(result);
                return;
            }

            res.json({
                success: result.success,
                data: result.data,
                pagination: result.pagination
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    
    // GET /api/resources/:id
    async getResourceById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await resourceService.getResourceById(id);

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    
    // POST /api/resources
    async createResource(req: Request, res: Response): Promise<void> {
        try {
            const resourceData: CreateResourceRequest = req.body;
            const result = await resourceService.createResource(resourceData);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.status(201).json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    
    // PUT /api/resources/:id
    async updateResource(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: UpdateResourceRequest = req.body;
            const result = await resourceService.updateResource(id, updateData);

            if (!result.success) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json(result);
                return;
            }

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // PATCH /api/resources/:id
    async patchResource(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const patchData: PatchResourceRequest = req.body;
            const result = await resourceService.patchResource(id, patchData);

            if (!result.success) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json(result);
                return;
            }

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // DELETE /api/resources/:id
    async deleteResource(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await resourceService.deleteResource(id);

            if (!result.success) {
                res.status(404).json(result);
                return;
            }

            res.json(result);

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

export default new ResourceController();
