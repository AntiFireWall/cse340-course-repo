import { getAllProjects, getUpcomingProjects, getProjectDetails } from "../models/projects.js";

const showProjectsPage = async (req, res) => {
    const limit = req.query.limit || 5;
    const projects = await getUpcomingProjects(limit);

    const title = 'Upcoming Service Projects';
    res.render('projects', { title, projects });
};

const showProjectPage = async (req, res) => {
    const projectId = req.params.id;
    const projectDetails = await getProjectDetails(projectId);
    const title = 'Project Details';

    res.render('project', {title, projectDetails});
};

export { showProjectsPage, showProjectPage };