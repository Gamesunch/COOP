const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// GET /api/profile - Fetch current user's full profile
exports.getProfile = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, email, first_name, last_name, role, bio, profile_picture_url, university, major, year_of_study, created_at 
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            bio: user.bio || '',
            profilePictureUrl: user.profile_picture_url || '',
            university: user.university || '',
            major: user.major || '',
            yearOfStudy: user.year_of_study || '',
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
};

// PUT /api/profile - Update editable profile fields (bio only for students)
exports.updateProfile = async (req, res) => {
    try {
        const { bio, yearOfStudy } = req.body;

        const result = await db.query(
            `UPDATE users SET bio = $1, year_of_study = $2 WHERE id = $3 
             RETURNING id, email, first_name, last_name, role, bio, profile_picture_url, university, major, year_of_study`,
            [bio, yearOfStudy, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                bio: user.bio || '',
                profilePictureUrl: user.profile_picture_url || '',
                university: user.university || '',
                major: user.major || '',
                yearOfStudy: user.year_of_study || ''
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
};

// POST /api/profile/picture - Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Delete old profile picture if it exists
        const oldResult = await db.query(
            'SELECT profile_picture_url FROM users WHERE id = $1',
            [req.user.id]
        );
        if (oldResult.rows.length > 0 && oldResult.rows[0].profile_picture_url) {
            const oldPath = path.join(__dirname, '../../uploads', path.basename(oldResult.rows[0].profile_picture_url));
            fs.unlink(oldPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.warn('Failed to delete old profile picture:', err.message);
                }
            });
        }

        // Build the URL path to access the uploaded file
        const profilePictureUrl = `/uploads/${req.file.filename}`;

        const result = await db.query(
            `UPDATE users SET profile_picture_url = $1 WHERE id = $2 
             RETURNING id, profile_picture_url`,
            [profilePictureUrl, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: result.rows[0].profile_picture_url
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ error: 'Server error uploading profile picture' });
    }
};
