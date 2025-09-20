import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import serverAPI from '../lib/server-api';

class ProjectLoader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'loadProject',
            'loadProjectList'
        ]);
        this.state = {
            projects: [],
            loading: false,
            error: null
        };
    }

    async loadProject (projectId) {
        if (!projectId) return;

        this.setState({ loading: true, error: null });

        try {
            const projectData = await serverAPI.loadProject(projectId);

            if (this.props.onProjectLoaded) {
                this.props.onProjectLoaded(projectData);
            }

            // Load the project into the VM
            if (this.props.vm) {
                if (projectData.projectBlob) {
                    // Server returned .sb3 file directly
                    await this.props.vm.loadProject(projectData.projectBlob);
                } else if (projectData.project) {
                    // Server returned JSON project data
                    await this.props.vm.loadProject(projectData.project);
                } else if (projectData.downloadUrl) {
                    // Server returned a download URL
                    await this.props.vm.loadProject(projectData.downloadUrl);
                }
            }

            this.setState({ loading: false });
        } catch (error) {
            console.error('Failed to load project:', error);
            this.setState({
                loading: false,
                error: error.message || 'Failed to load project'
            });
        }
    }

    async loadProjectList () {
        this.setState({ loading: true, error: null });

        try {
            const projects = await serverAPI.listProjects();
            this.setState({ projects, loading: false });
        } catch (error) {
            console.error('Failed to load project list:', error);
            this.setState({
                loading: false,
                error: error.message || 'Failed to load projects'
            });
        }
    }

    componentDidMount () {
        if (this.props.autoLoadList) {
            this.loadProjectList();
        }
    }

    render () {
        const {
            children
        } = this.props;

        return children({
            loadProject: this.loadProject,
            loadProjectList: this.loadProjectList,
            projects: this.state.projects,
            loading: this.state.loading,
            error: this.state.error
        });
    }
}

ProjectLoader.propTypes = {
    autoLoadList: PropTypes.bool,
    children: PropTypes.func.isRequired,
    onProjectLoaded: PropTypes.func,
    vm: PropTypes.object
};

ProjectLoader.defaultProps = {
    autoLoadList: false
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

export default connect(
    mapStateToProps,
    () => ({})
)(ProjectLoader);