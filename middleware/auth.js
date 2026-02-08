
// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
}

// Check if user is NOT authenticated (guest only)
function isGuest(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/tracks');
    }
    return next();
}

// Check if user is admin
function isAdmin(req, res, next) {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
}

// Check if user is owner of the resource OR is admin
// Requires: req.resourceOwnerId to be set by previous middleware
function isOwnerOrAdmin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized. Please login first.' });
    }
    
    // Admin can do anything
    if (req.session.role === 'admin') {
        return next();
    }
    
    // Check if user owns the resource
    if (req.resourceOwnerId && req.resourceOwnerId.toString() === req.session.userId) {
        return next();
    }
    
    return res.status(403).json({ error: 'Forbidden. You can only modify your own data.' });
}

module.exports = { isAuthenticated, isGuest, isAdmin, isOwnerOrAdmin };
