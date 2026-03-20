import express from 'express';

import { showHomePage } from './index.js';
import { showOrganizationsPage, showOrganizationDetailsPage } from './organizations.js';
import { showProjectsPage, showProjectPage } from './projects.js';
import { showCategoriesPage, showCategoryPage } from './categories.js';
import { testErrorPage } from './errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations/', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectPage);
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryPage);

// error-handling routes
router.get('/test-error', testErrorPage);

export default router;