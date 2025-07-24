import database from '../configs/database';
import { 
    Resource, 
    CreateResourceRequest, 
    UpdateResourceRequest, 
    PatchResourceRequest, 
    ResourceFilters, 
    ApiResponse, 
    PaginatedResponse 
} from '../types';

class ResourceService {
    
    // Get all resources with optional filtering
    async getAllResources(filters: ResourceFilters = {}): Promise<PaginatedResponse<Resource[]>> {
        try {
            let sql = 'SELECT * FROM resources WHERE 1=1';
            const params: any[] = [];

            // Filter by category
            if (filters.category) {
                sql += ' AND category LIKE ?';
                params.push(`%${filters.category}%`);
            }

            // Filter by status
            if (filters.status) {
                sql += ' AND status = ?';
                params.push(filters.status);
            }

            // Search in name and description
            if (filters.search) {
                sql += ' AND (name LIKE ? OR description LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            sql += ' ORDER BY created_at DESC';

            const resources = await database.all<Resource>(sql, params);

            return {
                success: true,
                data: resources,
                pagination: {
                    total: resources.length,
                    count: resources.length
                }
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    
    // Get resource by ID
    async getResourceById(id: string | number): Promise<ApiResponse<Resource>> {
        try {
            const resource = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);

            if (!resource) {
                return {
                    success: false,
                    error: 'Resource not found'
                };
            }

            return {
                success: true,
                data: resource
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    
    // Create new resource
    async createResource(data: CreateResourceRequest): Promise<ApiResponse<Resource>> {
        try {
            // Validation
            if (!data.name || data.name.trim() === '') {
                return {
                    success: false,
                    error: 'Name is required'
                };
            }

            if (!data.description) {
                return {
                    success: false,
                    error: 'Description is required'
                };
            }

            // Insert into database
            const sql = `
                INSERT INTO resources (name, description, category, status)
                VALUES (?, ?, ?, ?)
            `;
            const params = [
                data.name.trim(),
                data.description.trim(),
                data.category || 'General',
                data.status || 'active'
            ];

            const result = await database.run(sql, params);

            // Get the created resource
            const resource = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [result.id]);

            return {
                success: true,
                data: resource!,
                message: 'Resource created successfully'
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Update resource (PUT - replace entire resource)
    async updateResource(id: string | number, data: UpdateResourceRequest): Promise<ApiResponse<Resource>> {
        try {
            // Check if resource exists
            const existing = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);

            if (!existing) {
                return {
                    success: false,
                    error: 'Resource not found'
                };
            }

            // PUT requires name and description (core fields)
            if (!data.name || data.name.trim() === '') {
                return {
                    success: false,
                    error: 'Name is required for PUT operation'
                };
            }

            if (!data.description || data.description.trim() === '') {
                return {
                    success: false,
                    error: 'Description is required for PUT operation'
                };
            }

            // PUT replaces the entire resource with provided data
            const sql = `
                UPDATE resources
                SET name = ?, description = ?, category = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            const params = [
                data.name.trim(),
                data.description.trim(),
                data.category || 'General',
                data.status || 'active',
                id
            ];

            await database.run(sql, params);

            // Get updated resource
            const resource = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);

            return {
                success: true,
                data: resource!,
                message: 'Resource updated successfully'
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Patch resource (PATCH - partial update)
    async patchResource(id: string | number, data: PatchResourceRequest): Promise<ApiResponse<Resource>> {
        try {
            // Check if resource exists
            const existing = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);

            if (!existing) {
                return {
                    success: false,
                    error: 'Resource not found'
                };
            }

            // Build update query for only provided fields
            const updates: string[] = [];
            const params: any[] = [];

            if (data.name !== undefined) {
                if (data.name.trim() === '') {
                    return {
                        success: false,
                        error: 'Name cannot be empty'
                    };
                }
                updates.push('name = ?');
                params.push(data.name.trim());
            }
            if (data.description !== undefined) {
                if (data.description.trim() === '') {
                    return {
                        success: false,
                        error: 'Description cannot be empty'
                    };
                }
                updates.push('description = ?');
                params.push(data.description.trim());
            }
            if (data.category !== undefined) {
                updates.push('category = ?');
                params.push(data.category || 'General');
            }
            if (data.status !== undefined) {
                // Validate status value
                if (!['active', 'inactive'].includes(data.status)) {
                    return {
                        success: false,
                        error: 'Status must be either "active" or "inactive"'
                    };
                }
                updates.push('status = ?');
                params.push(data.status);
            }

            if (updates.length === 0) {
                return {
                    success: true,
                    data: existing,
                    message: 'No changes made'
                };
            }

            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);

            const sql = `UPDATE resources SET ${updates.join(', ')} WHERE id = ?`;
            await database.run(sql, params);

            // Get updated resource
            const resource = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);

            return {
                success: true,
                data: resource!,
                message: 'Resource patched successfully'
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Delete resource
    async deleteResource(id: string | number): Promise<ApiResponse> {
        try {
            // Check if resource exists
            const existing = await database.get<Resource>('SELECT * FROM resources WHERE id = ?', [id]);

            if (!existing) {
                return {
                    success: false,
                    error: 'Resource not found'
                };
            }

            await database.run('DELETE FROM resources WHERE id = ?', [id]);

            return {
                success: true,
                message: 'Resource deleted successfully'
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Clear all resources (useful for testing)
    async clearAllResources(): Promise<ApiResponse> {
        try {
            return await database.clearAllData();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

export default new ResourceService();
