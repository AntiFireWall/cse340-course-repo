import { getAllCategories, getCaategoryDetailes } from "../models/categories.js";
import { getProjectsByCategoryId } from "../models/projects.js";

const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();

    const title = 'Categories';
    res.render('categories', { title, categories });
};

const showCategoryPage = async (req, res) => {
    const categoryId = req.params.id;
    const categoryDetails = await getCaategoryDetailes(categoryId);
    const projects = await getProjectsByCategoryId(categoryId)

    const title = 'Category Details';
    res.render('category', { title, categoryDetails, projects })
};

export { showCategoriesPage, showCategoryPage };