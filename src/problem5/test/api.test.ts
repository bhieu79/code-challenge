import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import app from '../src/server';
import resourceService from '../src/services/resourceService';
import { CreateResourceRequest, UpdateResourceRequest, PatchResourceRequest } from '../src/types';

chai.use(chaiHttp);

describe('Simple CRUD API Tests', () => {

    beforeEach(async () => {
        // Clear all resources before each test
        await resourceService.clearAllResources();
    });

    it('Should return health status', (done) => {
        chai.request(app)
            .get('/health')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.message).to.equal('Server is running');
                done();
            });
    });

    it('Should get empty resources list', (done) => {
        chai.request(app)
            .get('/api/resources')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.success).to.be.true;
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.have.length(0);
                done();
            });
    });

    it('Should create a resource', (done) => {
        const newResource: CreateResourceRequest = {
            name: 'Test Resource',
            description: 'A test resource',
            category: 'Testing'
        };

        chai.request(app)
            .post('/api/resources')
            .send(newResource)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body.success).to.be.true;
                expect(res.body.data.name).to.equal(newResource.name);
                expect(res.body.data.description).to.equal(newResource.description);
                expect(res.body.data.category).to.equal(newResource.category);
                expect(res.body.data.id).to.be.a('number');
                done();
            });
    });

    it('Should get a resource by ID', (done) => {
        const newResource: CreateResourceRequest = {
            name: 'Findable Resource',
            description: 'This can be found',
            category: 'Testing'
        };

        chai.request(app)
            .post('/api/resources')
            .send(newResource)
            .end((err, res) => {
                const resourceId = res.body.data.id;

                chai.request(app)
                    .get(`/api/resources/${resourceId}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.data.id).to.equal(resourceId);
                        expect(res.body.data.name).to.equal(newResource.name);
                        done();
                    });
            });
    });

    it('Should update a resource with PUT (full replacement)', (done) => {
        const originalResource: CreateResourceRequest = {
            name: 'Original Name',
            description: 'Original description',
            category: 'Original'
        };

        const updateData: UpdateResourceRequest = {
            name: 'Updated Name',
            description: 'Updated description',
            category: 'Updated Category',
            status: 'inactive'
        };

        chai.request(app)
            .post('/api/resources')
            .send(originalResource)
            .end((err, res) => {
                const resourceId = res.body.data.id;

                chai.request(app)
                    .put(`/api/resources/${resourceId}`)
                    .send(updateData)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.data.name).to.equal(updateData.name);
                        expect(res.body.data.description).to.equal(updateData.description);
                        expect(res.body.data.category).to.equal(updateData.category);
                        expect(res.body.data.status).to.equal(updateData.status);
                        done();
                    });
            });
    });

    it('Should require name and description for PUT', (done) => {
        const originalResource: CreateResourceRequest = {
            name: 'Original Name',
            description: 'Original description',
            category: 'Original'
        };

        chai.request(app)
            .post('/api/resources')
            .send(originalResource)
            .end((err, res) => {
                const resourceId = res.body.data.id;

                chai.request(app)
                    .put(`/api/resources/${resourceId}`)
                    .send({ name: 'Only Name' }) // Missing description
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body.success).to.be.false;
                        expect(res.body.error).to.equal('Description is required for PUT operation');
                        done();
                    });
            });
    });

    it('Should patch a resource (partial update)', (done) => {
        const originalResource: CreateResourceRequest = {
            name: 'Original Name',
            description: 'Original description',
            category: 'Original'
        };

        const patchData: PatchResourceRequest = {
            name: 'Patched Name'
            // Only updating name, other fields should remain unchanged
        };

        chai.request(app)
            .post('/api/resources')
            .send(originalResource)
            .end((err, res) => {
                const resourceId = res.body.data.id;

                chai.request(app)
                    .patch(`/api/resources/${resourceId}`)
                    .send(patchData)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.data.name).to.equal(patchData.name);
                        expect(res.body.data.description).to.equal(originalResource.description); // Unchanged
                        expect(res.body.data.category).to.equal(originalResource.category); // Unchanged
                        expect(res.body.data.status).to.equal('active'); // Default unchanged
                        done();
                    });
            });
    });

    it('Should validate status in PATCH', (done) => {
        const originalResource: CreateResourceRequest = {
            name: 'Original Name',
            description: 'Original description'
        };

        chai.request(app)
            .post('/api/resources')
            .send(originalResource)
            .end((err, res) => {
                const resourceId = res.body.data.id;

                chai.request(app)
                    .patch(`/api/resources/${resourceId}`)
                    .send({ status: 'invalid_status' })
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body.success).to.be.false;
                        expect(res.body.error).to.equal('Status must be either "active" or "inactive"');
                        done();
                    });
            });
    });

    it('Should delete a resource', (done) => {
        const newResource: CreateResourceRequest = {
            name: 'To Delete',
            description: 'This will be deleted',
            category: 'Testing'
        };

        chai.request(app)
            .post('/api/resources')
            .send(newResource)
            .end((err, res) => {
                const resourceId = res.body.data.id;

                chai.request(app)
                    .delete(`/api/resources/${resourceId}`)
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res.body.success).to.be.true;
                        expect(res.body.message).to.equal('Resource deleted successfully');

                        // Verify it's deleted
                        chai.request(app)
                            .get(`/api/resources/${resourceId}`)
                            .end((err, res) => {
                                expect(res).to.have.status(404);
                                done();
                            });
                    });
            });
    });

    it('Should return 404 for non-existent resource', (done) => {
        chai.request(app)
            .get('/api/resources/999')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.equal('Resource not found');
                done();
            });
    });

    it('Should return 400 for missing required fields', (done) => {
        chai.request(app)
            .post('/api/resources')
            .send({ description: 'No name provided' })
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body.success).to.be.false;
                expect(res.body.error).to.equal('Name is required');
                done();
            });
    });

    it('Should filter resources by category', (done) => {
        const resource1: CreateResourceRequest = { name: 'Resource 1', description: 'First', category: 'CategoryA' };
        const resource2: CreateResourceRequest = { name: 'Resource 2', description: 'Second', category: 'CategoryB' };

        // Create two resources with different categories
        chai.request(app)
            .post('/api/resources')
            .send(resource1)
            .end(() => {
                chai.request(app)
                    .post('/api/resources')
                    .send(resource2)
                    .end(() => {
                        // Filter by CategoryA
                        chai.request(app)
                            .get('/api/resources?category=CategoryA')
                            .end((err, res) => {
                                expect(res).to.have.status(200);
                                expect(res.body.data).to.have.length(1);
                                expect(res.body.data[0].category).to.equal('CategoryA');
                                done();
                            });
                    });
            });
    });

});
