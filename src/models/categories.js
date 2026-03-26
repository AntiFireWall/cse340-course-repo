import db from './db.js'

const getAllCategories = async() => {
    const query = `
      SELECT name, category_id
      FROM public.category;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getCategoryDetailes = async (categoryId) => {
    const query = `
      SELECT name, category_id
      FROM public.category
      WHERE category_id = $1;
    `;

    const query_params = [categoryId];
    const result = await db.query(query, query_params);

    return result.rows.length > 0 ? result.rows[0] : null;
};

const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
      INSERT INTO project_category (project_id, category_id) 
      VALUES ($1, $2);
    `;

    const query_params = [projectId, categoryId];
    await db.query(query, query_params);
};

const updateCategoryAssignments = async (projectId, categoryIds) => {
    const query = `
        DELETE FROM project_category
        WHERE project_id = $1;
    `;

    await db.query(query, [projectId]);

    for (const categoryId of categoryIds) {
        await assignCategoryToProject(projectId, categoryId);
    }
};

const getCategoriesByServiceProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM category c
        JOIN project_category pc ON c.category_id = pc.category_id
        LEFT JOIN project p ON pc.project_id = p.project_id
        WHERE p.project_id = $1;
    `;

    const query_params = [projectId];
    const result = await db.query(query, query_params);

    return result.rows;
};

export { getAllCategories, getCategoryDetailes, getCategoriesByServiceProjectId, updateCategoryAssignments }  