// Middleware to require logged-in session
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    req.session.flash = { error: 'Please log in to access this page.' };
    return res.redirect('/login');
  }
  next();
}

// Middleware to restrict access by user role(s)
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.session.flash = { error: 'Please log in to continue.' };
      return res.redirect('/login');
    }

    if (!roles.includes(req.session.user.role)) {
      req.session.flash = {
        error: `Access Denied. Your account role (${req.session.user.role}) is not authorized to view that administrative page.`
      };
      
      // Redirect to user's authorized home dashboard
      if (req.session.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else if (req.session.user.role === 'staff') {
        return res.redirect('/staff/dashboard');
      } else {
        return res.redirect('/dashboard');
      }
    }

    next();
  };
}

// Middleware to redirect already logged-in users away from login/register
function guestOnly(req, res, next) {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (req.session.user.role === 'staff') {
      return res.redirect('/staff/dashboard');
    } else {
      return res.redirect('/dashboard');
    }
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  guestOnly
};
