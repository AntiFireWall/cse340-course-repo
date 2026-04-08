import db from './db.js';
import bcrypt from 'bcrypt';

const createUser = async (name, email, passwordHash, ) => {
    let default_role = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4)) 
        RETURNING user_id
    `;
    const query_params = [name, email, passwordHash, default_role];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const getUsersList = async () => {
    const query = `
        SELECT u.name, u.email, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
    `;
    
    const result = await db.query(query);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE email = $1
    `;
    const query_params = [email];
    
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        return null; // User not found
    }
    
    return result.rows[0];
};

const registerUserToProject = async (userId, projectId) => {
    const query = `
        INSERT INTO project_users (project_id, user_id) 
        VALUES ($1, $2)
    `;
    const query_params = [ projectId, userId ];
    
    const result = await db.query(query, query_params);
    
    return result.rows[0];
};

const unregisterUserFromProject = async (userId, projectId) => {
    const query = `
        DELETE FROM project_users 
        WHERE project_id = $1 AND user_id = $2;
    `;
    const query_params = [ projectId, userId ];
    
    const result = await db.query(query, query_params);
    
    return result.rows[0];
};

const isVolunteered = async (userId, projectId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1 
            FROM project_users 
            WHERE user_id = $1 AND project_id = $2
        ) AS "isVolunteered";
    `;
    const query_params = [ userId, projectId ];
    
    const result = await db.query(query, query_params);
    
    return result.rows[0].isVolunteered;
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (email, password) => {
    const userDetails = await findUserByEmail(email);

    if (!userDetails) {
        return null;
    }

    const passwordVerified = await verifyPassword(password, userDetails.password_hash);

    if (passwordVerified) {
        delete userDetails.password_hash;
        return userDetails
    }

    return null;
};

export { createUser, authenticateUser, getUsersList, registerUserToProject, unregisterUserFromProject, isVolunteered };