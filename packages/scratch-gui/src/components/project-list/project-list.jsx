import React from 'react';
import PropTypes from 'prop-types';

const ProjectList = ({
    projects,
    onProjectSelect,
    onProjectDelete,
    loading,
    error,
    selectedProjectId
}) => {
    if (loading) {
        return <div className="project-list-loading">Loading projects...</div>;
    }

    if (error) {
        return <div className="project-list-error">Error: {error}</div>;
    }

    if (!projects || projects.length === 0) {
        return <div className="project-list-empty">No projects found</div>;
    }

    return (
        <div className="project-list">
            <h3>Your Projects</h3>
            {projects.map(project => (
                <div
                    key={project.id}
                    className={`project-item ${selectedProjectId === project.id ? 'selected' : ''}`}
                >
                    <div
                        className="project-info"
                        onClick={() => onProjectSelect && onProjectSelect(project.id)}
                    >
                        <h4>{project.title || `Project ${project.id}`}</h4>
                        <p>Last modified: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
                        {project.thumbnail && (
                            <img
                                src={project.thumbnail}
                                alt="Project thumbnail"
                                className="project-thumbnail"
                            />
                        )}
                    </div>
                    {onProjectDelete && (
                        <button
                            className="project-delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onProjectDelete(project.id);
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

ProjectList.propTypes = {
    projects: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string,
        thumbnail: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string
    })),
    onProjectSelect: PropTypes.func,
    onProjectDelete: PropTypes.func,
    loading: PropTypes.bool,
    error: PropTypes.string,
    selectedProjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default ProjectList;