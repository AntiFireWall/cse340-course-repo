import { getAllCategories, getCategoryDetailes, getCategoriesByServiceProjectId, updateCategoryAssignments, createCategory, updateCategory, categoryExists } from "../models/categories.js";
import { getProjectsByCategoryId, getProjectDetails } from "../models/projects.js";
import { body, validationResult } from 'express-validator';

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
        .custom(async (value, { req }) => {
            const categoryId = req.params.id;
            const exists = await categoryExists(value, categoryId);
            if (exists) throw new Error('Category name already exists');
            return true;
        })
];

const showCategoriesPage = async (req, res) => {
    const categories = await getAllCategories();

    const title = 'Categories';
    res.render('categories', { title, categories });
};

const showCategoryPage = async (req, res) => {
    const categoryId = req.params.id;
    const categoryDetails = await getCategoryDetailes(categoryId);
    const projects = await getProjectsByCategoryId(categoryId)

    const title = 'Category Details';
    res.render('category', { title, categoryDetails, projects })
};

const showAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const projectDetails = await getProjectDetails(projectId);
    const categories = await getAllCategories();
    const projectCategories = await getCategoriesByServiceProjectId(projectId);

    const title = 'Assign Categories to Project';
    res.render('assign-categories', { title, projectDetails, categories, projectCategories });
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const selectedCategoryIds = req.body.categoryIds || [];

    const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];
    await updateCategoryAssignments(projectId, categoryIdsArray);
    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

const showNewCategoryForm = async (req, res) => {
    const title = 'Add New Category';
    
    res.render('new-category', { title });
};

const processNewCategoryForm = async (req, res) => {
    const results = validationResult(req);

    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect('/new-category');
    }

    const { name } = req.body;

    const categoryId = await createCategory(name);

    req.flash('success', 'Category added successfully!');

    res.redirect(`/category/${categoryId}`);
};

const showEditCategoryForm = async (req, res) => {
    const categoryId = req.params.id;
    const categoryDetails = await getCategoryDetailes(categoryId);
    console.log(categoryDetails);
    const title = 'Edit Category';
    
    res.render('edit-category', { title, categoryDetails });
};

const processEditCategoryForm = async (req, res) => {
    const results = validationResult(req);
    const categoryId = req.params.id;

    if (!results.isEmpty()) {
        // Validation failed - loop through errors
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new organization form
        return res.redirect(`/edit-category/${categoryId}`);
    }

    const { name } = req.body;
    await updateCategory(name, categoryId);

    req.flash('success', 'Category updated successfully!');

    res.redirect(`/category/${categoryId}`);
};

export { 
    showCategoriesPage, 
    showCategoryPage, 
    showAssignCategoriesForm, 
    processAssignCategoriesForm, 
    categoryValidation, 
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm    
};