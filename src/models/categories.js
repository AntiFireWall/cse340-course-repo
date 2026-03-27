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

const createCategory = async (categoryName) => {
    const query = `
        INSERT INTO category (name)
        VALUES ($1)
        RETURNING category_id;
    `;

    const query_params = [categoryName];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].category_id);
    }

    return result.rows[0].category_id;
};

const updateCategory = async (categoryName, categoryId) => {
    const query = `
      UPDATE category
      SET name = $1
      WHERE category_id = $2
      RETURNING category_id;
    `;

    const query_params = [categoryName, categoryId];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
      console.log('Updated category with ID:', categoryId);
    }

    return result.rows[0].category_id;
};

const categoryExists = async (categoryName, excludeId) => {
    let query = `
        SELECT
          name
        FROM category
        WHERE name = $1 
        `;

    const query_params = [categoryName];

    if (excludeId) {
        query += ` AND category_id != $2`;
        query_params.push(excludeId);
    } else {
        
    }

    const result = await db.query(query, query_params);

    return result.rows.length > 0;
};

export { getAllCategories, getCategoryDetailes, getCategoriesByServiceProjectId, updateCategoryAssignments, createCategory, updateCategory, categoryExists }  