import bcrypt from 'bcrypt';
import { createUser, authenticateUser, getUsersList, registerUserToProject, unregisterUserFromProject } from '../models/users.js';
import { getProjectsByUserId } from '../models/projects.js';

const showUserRegistrationForm = (req, res) => {
    const title = 'Register';

    res.render('register', { title });
}

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userId = await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);
        if (user) {
            // Store user info in session
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = async (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

const requireLogin = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
}; 

const requireRole = (role, redirect = '/') => {
    return (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }

    if (req.session.user.role_name !== role) {
        req.flash('error', 'You do not have permission to access this page.');
        return res.redirect(redirect);
    }

    next();
}}; 

const showDashboard = async (req, res) => {
    const user = req.session.user;
    const title = 'Dashboard';
    const volunteeredProjects = await getProjectsByUserId(user.user_id); 
    res.render('dashboard', { title, user, volunteeredProjects });
};

const showUsersList = async (req, res) => {
    const title = 'Registered Users List';
    const usersListDetails = await getUsersList();

    res.render('users', { title, usersListDetails });
};

const processUserToProjectRegistration = async (req, res) => {
    const userId = req.session.user.user_id;
    const { project_id } = req.body;

    try {
        await registerUserToProject(userId, project_id);

        req.flash('success', 'You have successfully volunteered!');
        res.redirect(`/project/${project_id}`);
    } catch (error) {
        console.error('Error volunteering the user:', error);
        req.flash('error', 'An error occurred during volunteering process. Please try again.');
        res.redirect(`/project/${project_id}`);
    }
};

const processUserFromProjectUnregistration = async (req, res) => {
    const userId = req.session.user.user_id;
    const { project_id } = req.body;

    try {
        await unregisterUserFromProject(userId, project_id);

        req.flash('success', 'You have successfully left the project!');
        res.redirect(`/project/${project_id}`);
    } catch (error) {
        console.error('Error unvolunteering the user from project:', error);
        req.flash('error', 'An error occurred during unregistering from project process. Please try again.');
        res.redirect(`/project/${project_id}`);
    }
};

export { showUserRegistrationForm, processUserRegistrationForm, showLoginForm, processLoginForm, processLogout, requireLogin, showDashboard, requireRole, showUsersList, processUserToProjectRegistration, processUserFromProjectUnregistration };
