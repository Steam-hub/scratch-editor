class ServerAPI {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async saveProject(projectId, projectData, metadata = {}) {
        const formData = new FormData();
        // projectData is already a Blob (ZIP file containing .sb3 project)
        formData.append('file', projectData, 'project.sb3');

        // Add metadata as additional form fields if needed
        if (metadata && Object.keys(metadata).length > 0) {
            formData.append('metadata', JSON.stringify(metadata));
        }

        // Extract token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        console.log('token', token);
        

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('https://stage.api.steamhub.cloud/studio/Upload-file/', {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Failed to save project: ${response.statusText}`);
        }

        const uploadResult = await response.json();

        // Check user role and artifact ID for different API endpoints
        const artifactId = urlParams.get('artifactId') || urlParams.get('artifact_id');
        const userRole = urlParams.get('role');

        if (artifactId && uploadResult.cloudfront_url) {
            try {
                const updateHeaders = {
                    'Content-Type': 'application/json'
                };
                if (token) {
                    updateHeaders['Authorization'] = `Bearer ${token}`;
                }

                if (userRole === 'student') {
                    // Student submission endpoint
                    const submissionResponse = await fetch(`https://stage.api.steamhub.cloud/organization/results/artifact/${artifactId}/submission/`, {
                        method: 'POST',
                        headers: updateHeaders,
                        body: JSON.stringify({
                            content: JSON.stringify({
                                cloudfront_url: uploadResult.cloudfront_url
                            })
                        })
                    });

                    if (!submissionResponse.ok) {
                        console.error('Failed to submit student artifact:', submissionResponse.statusText);
                    }
                } else {
                    // Regular artifact update endpoint (for non-students)
                    const updateResponse = await fetch(`https://stage.api.steamhub.cloud/studio/artifacts/update/${artifactId}/`, {
                        method: 'PUT',
                        headers: updateHeaders,
                        body: JSON.stringify({
                            artifact_data: JSON.stringify({
                                cloudfront_url: uploadResult.cloudfront_url
                            })
                        })
                    });

                    if (!updateResponse.ok) {
                        console.error('Failed to update artifact:', updateResponse.statusText);
                    }
                }
            } catch (error) {
                console.error('Error updating artifact:', error);
            }
        }

        return uploadResult;
    }

    async loadProject(projectId) {
        const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to load project: ${response.statusText}`);
        }

        // Check if response is binary (.sb3 file) or JSON metadata
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/zip') ||
            contentType && contentType.includes('application/octet-stream')) {
            // Server returned the .sb3 file directly
            const sb3Blob = await response.blob();
            return { projectBlob: sb3Blob };
        } else {
            // Server returned JSON with metadata and possibly project data
            return await response.json();
        }
    }

    async listProjects() {
        const response = await fetch(`${this.baseURL}/projects`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to list projects: ${response.statusText}`);
        }

        return await response.json();
    }

    async deleteProject(projectId) {
        const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete project: ${response.statusText}`);
        }

        return await response.json();
    }

    async saveProjectThumbnail(projectId, thumbnailBlob) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailBlob);

        const response = await fetch(`${this.baseURL}/projects/${projectId}/thumbnail`, {
            method: 'PUT',
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to save thumbnail: ${response.statusText}`);
        }

        return await response.json();
    }
}

export default new ServerAPI();