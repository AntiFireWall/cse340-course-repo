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

export { getAllProjects, getProjectsByOrganizationId }  