/**
 * Authentication Middleware
 * Protects routes that require user authentication
 */

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
}

// Check if user is NOT authenticated (for login/register pages)
function isGuest(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/tracks');
    }
    return next();
}

module.exports = { isAuthenticated, isGuest };
