const userModel = require('../models/userModel');

const authController = {
  getLogin(req, res) {
    res.render('auth/login', {
      title: 'Sign In - Campus Maintenance System',
      values: {}
    });
  },

  postLogin(req, res) {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      req.session.flash = { error: 'Please enter both your email address and password.' };
      return res.render('auth/login', {
        title: 'Sign In - Campus Maintenance System',
        values: { email }
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = userModel.findByEmail(trimmedEmail);

    if (!user) {
      req.session.flash = { error: 'Invalid email or password. Please verify your credentials.' };
      return res.render('auth/login', {
        title: 'Sign In - Campus Maintenance System',
        values: { email }
      });
    }

    const isMatch = userModel.verifyPassword(password, user.password);
    if (!isMatch) {
      req.session.flash = { error: 'Invalid email or password. Please verify your credentials.' };
      return res.render('auth/login', {
        title: 'Sign In - Campus Maintenance System',
        values: { email }
      });
    }

    // Save user in session (excluding password)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      staff_id: user.staff_id,
      specialization: user.specialization
    };

    req.session.flash = { success: `Welcome back, ${user.name}!` };

    // Redirect to respective dashboard based on role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'staff') {
      return res.redirect('/staff/dashboard');
    } else {
      return res.redirect('/dashboard');
    }
  },

  getRegister(req, res) {
    res.render('auth/register', {
      title: 'Create Account - Campus Maintenance System',
      values: {}
    });
  },

  postRegister(req, res) {
    const { name, email, role, department, password, confirmPassword } = req.body;
    const values = { name, email, role, department };

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      req.session.flash = { error: 'All required fields must be filled out.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }

    if (name.trim().length < 2) {
      req.session.flash = { error: 'Name must be at least 2 characters long.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      req.session.flash = { error: 'Please enter a valid email address.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }

    // Password validation
    if (password.length < 6) {
      req.session.flash = { error: 'Password must be at least 6 characters long.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }

    if (password !== confirmPassword) {
      req.session.flash = { error: 'Passwords do not match. Please re-enter.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }

    // Allowed self-registration roles (staff and admin accounts are restricted/managed)
    const validRole = (role === 'faculty') ? 'faculty' : 'student';

    // Duplicate email check
    const existing = userModel.findByEmail(email.trim());
    if (existing) {
      req.session.flash = { error: 'An account with this email address already exists.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }

    try {
      const newUser = userModel.createUser({
        name,
        email,
        password,
        role: validRole,
        department: department || (validRole === 'student' ? 'Student Body' : 'Academic Faculty')
      });

      req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      };

      req.session.flash = { success: 'Your account has been created successfully! Welcome to the Campus Maintenance System.' };
      return res.redirect('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      req.session.flash = { error: 'An unexpected error occurred while creating your account. Please try again.' };
      return res.render('auth/register', { title: 'Create Account', values });
    }
  },

  postLogout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error('Logout error:', err);
      res.redirect('/login');
    });
  },

  getProfile(req, res) {
    const user = userModel.findById(req.session.user.id);
    res.render('profile', {
      title: 'My Profile - Campus Maintenance System',
      user
    });
  },

  postProfile(req, res) {
    const { name, department, specialization } = req.body;
    const userId = req.session.user.id;

    if (!name || name.trim().length < 2) {
      req.session.flash = { error: 'Name must be at least 2 characters long.' };
      return res.redirect('/profile');
    }

    try {
      userModel.updateProfile(userId, { name, department, specialization });
      // Update session info
      req.session.user.name = name.trim();
      req.session.user.department = department ? department.trim() : '';
      if (specialization) req.session.user.specialization = specialization.trim();

      req.session.flash = { success: 'Profile details updated successfully.' };
    } catch (err) {
      console.error('Profile update error:', err);
      req.session.flash = { error: 'Failed to update profile information.' };
    }

    res.redirect('/profile');
  },

  postChangePassword(req, res) {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.session.user.id;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      req.session.flash = { error: 'All password fields are required.' };
      return res.redirect('/profile');
    }

    if (newPassword.length < 6) {
      req.session.flash = { error: 'New password must be at least 6 characters long.' };
      return res.redirect('/profile');
    }

    if (newPassword !== confirmNewPassword) {
      req.session.flash = { error: 'New passwords do not match.' };
      return res.redirect('/profile');
    }

    const user = userModel.findByEmail(req.session.user.email);
    if (!userModel.verifyPassword(currentPassword, user.password)) {
      req.session.flash = { error: 'Current password is incorrect.' };
      return res.redirect('/profile');
    }

    try {
      userModel.updatePassword(userId, newPassword);
      req.session.flash = { success: 'Password changed successfully!' };
    } catch (err) {
      console.error('Password change error:', err);
      req.session.flash = { error: 'Failed to update password.' };
    }

    res.redirect('/profile');
  }
};

module.exports = authController;
