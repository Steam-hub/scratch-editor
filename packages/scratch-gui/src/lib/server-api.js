class ServerAPI {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    async saveProject(projectId, projectData, metadata = {}) {
        const url = projectId ? `${this.baseURL}/projects/${projectId}` : `${this.baseURL}/projects`;
        const method = projectId ? 'PUT' : 'POST';

        const formData = new FormData();
        // projectData is already a Blob (ZIP file containing .sb3 project)
        formData.append('project', projectData, 'project.sb3');
        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch(url, {
            method,
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to save project: ${response.statusText}`);
        }

        return await response.json();
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