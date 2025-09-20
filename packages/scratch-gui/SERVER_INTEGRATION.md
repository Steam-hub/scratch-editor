# Server-Based Project Storage Implementation

This implementation adds server-based project storage with unique file IDs to Scratch GUI, replacing local file downloads.

## Components Added/Modified

### 1. Server API (`src/lib/server-api.js`)
Handles all server communication for project operations:
- `saveProject(projectId, projectData, metadata)` - Save/update projects
- `loadProject(projectId)` - Load project by ID
- `listProjects()` - Get user's project list
- `deleteProject(projectId)` - Delete project
- `saveProjectThumbnail(projectId, thumbnailBlob)` - Save project thumbnail

### 2. Project Saver HOC (`src/lib/project-saver-hoc.jsx`)
Updated to support server saving when `useServerAPI` prop is true:
- Fallback to original behavior when `useServerAPI` is false
- Uses server API for project and thumbnail saving

### 3. SB3 Downloader (`src/containers/sb3-downloader.jsx`)
Modified to save to server instead of downloading:
- When `useServerAPI` is true, saves to server with project metadata
- Falls back to local download on server errors
- Supports both new project creation and updates

### 4. Project Loader (`src/containers/project-loader.jsx`)
New component for loading projects from server:
- `loadProject(projectId)` - Load specific project
- `loadProjectList()` - Load user's projects
- Integrates with Redux state

### 5. Project List Component (`src/components/project-list/project-list.jsx`)
UI component for displaying projects:
- Shows project list with titles and thumbnails
- Handles project selection and deletion
- Loading and error states

## Usage Example

```jsx
import ProjectSaverHOC from '../lib/project-saver-hoc';
import SB3Downloader from '../containers/sb3-downloader';
import ProjectLoader from '../containers/project-loader';
import ProjectList from '../components/project-list/project-list';

// Enable server-based saving
const ProjectSaverWithServer = ProjectSaverHOC(YourComponent);

<ProjectSaverWithServer
    useServerAPI={true}
    // ... other props
/>

// Server-based saving in menu
<SB3Downloader
    useServerAPI={true}
    onProjectSaved={(projectId) => console.log('Saved with ID:', projectId)}
>
    {(className, downloadProject) => (
        <button onClick={downloadProject}>Save to Server</button>
    )}
</SB3Downloader>

// Loading projects
<ProjectLoader>
    {({loadProject, loadProjectList, projects, loading, error}) => (
        <div>
            <button onClick={loadProjectList}>Load My Projects</button>
            <ProjectList
                projects={projects}
                loading={loading}
                error={error}
                onProjectSelect={loadProject}
            />
        </div>
    )}
</ProjectLoader>
```

## Server API Requirements

Your server should implement these endpoints:

```
POST /api/projects
- Body: FormData with 'project' (JSON) and 'metadata' (JSON)
- Response: {id: string, ...}

PUT /api/projects/:id
- Body: FormData with 'project' (JSON) and 'metadata' (JSON)
- Response: {id: string, ...}

GET /api/projects/:id
- Response: {id: string, project: JSON, title: string, ...}

GET /api/projects
- Response: [{id: string, title: string, createdAt: string, updatedAt: string, thumbnail?: string}, ...]

DELETE /api/projects/:id
- Response: {success: boolean}

PUT /api/projects/:id/thumbnail
- Body: FormData with 'thumbnail' (Blob)
- Response: {success: boolean}
```

## Configuration

Set `useServerAPI: true` on components to enable server storage. The implementation gracefully falls back to local behavior when this prop is false or undefined.

All components maintain backward compatibility with the original local storage behavior.