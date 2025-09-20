import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';
import downloadBlob from '../lib/download-blob';
import serverAPI from '../lib/server-api';
/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SB3Downloader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SB3Downloader>
 */
class SB3Downloader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject'
        ]);
    }
    downloadProject () {
        this.props.saveProjectSb3().then(content => {
            if (this.props.onSaveFinished) {
                this.props.onSaveFinished();
            }

            if (this.props.useServerAPI) {
                // Save to server with current project ID or create new
                const projectId = this.props.projectId || null;
                const metadata = {
                    title: this.props.projectTitle || 'Untitled Project',
                    filename: this.props.projectFilename
                };

                serverAPI.saveProject(projectId, content, metadata)
                    .then(response => {
                        console.log('Project saved to server with ID:', response.id);
                        // Optionally update the UI with the new project ID
                        if (this.props.onProjectSaved) {
                            this.props.onProjectSaved(response.id);
                        }
                    })
                    .catch(error => {
                        console.error('Failed to save project to server:', error);
                        // Fallback to local download if server fails
                        downloadBlob(this.props.projectFilename, content);
                    });
            } else {
                // Original local download behavior
                downloadBlob(this.props.projectFilename, content);
            }
        });
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.downloadProject
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.sb3`;
};

SB3Downloader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    onSaveFinished: PropTypes.func,
    onProjectSaved: PropTypes.func,
    projectFilename: PropTypes.string,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    projectTitle: PropTypes.string,
    saveProjectSb3: PropTypes.func,
    useServerAPI: PropTypes.bool
};
SB3Downloader.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState),
    projectId: state.scratchGui.projectState.projectId,
    projectTitle: state.scratchGui.projectTitle
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(SB3Downloader);
