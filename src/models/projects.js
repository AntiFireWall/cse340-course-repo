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

const getProjectsByCategoryId = async (categoryId) => {
      const query = `
        SELECT
          p.project_id,
          p.title,
          p.description,
          p.location,
          p.project_date
        FROM project p
        JOIN project_category pc ON p.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY p.project_date;
      `;
      
      const query_params = [categoryId];
      const result = await db.query(query, query_params);

      return result.rows;
};

const getProjectsByUserId = async (userId) => {
      const query = `
        SELECT
          p.project_id,
          p.title,
          p.project_date
        FROM project p
        JOIN project_users pu ON p.project_id = pu.project_id
        WHERE pu.user_id = $1
        ORDER BY p.project_date;
      `;
      
      const query_params = [userId];
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
            p.project_date, 
            -- Use COALESCE to return an empty array [] instead of [null] when no categories exist
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT('id', c.category_id, 'name', c.name)
                ) FILTER (WHERE c.category_id IS NOT NULL), 
                '[]'
            ) AS category_list 
        FROM project p 
        JOIN organization o ON p.organization_id = o.organization_id 
        LEFT JOIN project_category pc ON p.project_id = pc.project_id 
        LEFT JOIN category c ON pc.category_id = c.category_id 
        WHERE p.project_id = $1 
        GROUP BY 
            p.project_id, 
            p.organization_id, 
            o.name, 
            p.title, 
            p.description, 
            p.location, 
            p.project_date;
      `;
      
      const query_params = [projectId];
      const result = await db.query(query, query_params);

      return result.rows.length > 0 ? result.rows[0] : null;
};

const createProject = async (title, description, location, project_date, organization_id) => {
    const query = `
      INSERT INTO project (organization_id, title, description, location, project_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING project_id
    `;

    const query_params = [organization_id, title, description, location, project_date];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
};

const updateProject = async (title, description, location, project_date, project_id, organization_id) => {
    const query = `
      UPDATE project
      SET title = $1, description = $2, location = $3, project_date = $4, organization_id = $5
      WHERE project_id = $6
      RETURNING project_id;
    `;

    const query_params = [title, description, location, project_date, organization_id, project_id];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
      throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
      console.log('Updated project with ID:', project_id);
    }

    return result.rows[0].project_id;
};

export { getAllProjects, getProjectsByOrganizationId, getProjectsByCategoryId, getProjectsByUserId, getUpcomingProjects, getProjectDetails, createProject, updateProject }  