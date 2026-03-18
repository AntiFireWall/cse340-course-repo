import db from './db.js'

const getAllProjects = async() => {
    const query = `
        SELECT p.title, o.name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          project_date
        FROM project 
        WHERE organization_id = $1
        ORDER BY project_date;
      `;
      
      const query_params = [organizationId];
      const result = await db.query(query, query_params);

      return result.rows;
};

const getUpcomingProjects = async (number_of_projects) => {
      const query = `
          SELECT
            p.project_id,
            p.organization_id,
            o.name AS organization_name,
            p.title,
            p.description,
            p.location,
            p.project_date
          FROM project p
          JOIN organization o ON p.organization_id = o.organization_id
          WHERE p.project_date >= CURRENT_DATE
          ORDER BY p.project_date ASC
          LIMIT $1;
      `;

      const query_params = [number_of_projects];
      const result = await db.query(query, query_params);

      return result.rows;
};

const getProjectDetails = async (projectId) => {
      const query = `
          SELECT
            p.project_id,
            p.organization_id,
            o.name AS organization_name,
            p.title,
            p.description,
            p.location,
            p.project_date
          FROM project p
          JOIN organization o ON p.organization_id = o.organization_id
          WHERE p.project_id = $1;
      `;
      
      const query_params = [projectId];
      const result = await db.query(query, query_params);

      return result.rows.length > 0 ? result.rows[0] : null;
};

export { getAllProjects, getProjectsByOrganizationId, getUpcomingProjects, getProjectDetails }  