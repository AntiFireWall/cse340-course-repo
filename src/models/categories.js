import db from './db.js'

const getAllCategories = async() => {
    const query = `
        SELECT name, category_id
      FROM public.category;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getCaategoryDetailes = async (categoryId) => {
    const query = `
        SELECT name, category_id
      FROM public.category
      WHERE category_id = $1;
    `;

    const query_params = [categoryId];
    const result = await db.query(query, query_params);

    return result.rows.length > 0 ? result.rows[0] : null;
};

export { getAllCategories, getCaategoryDetailes }  