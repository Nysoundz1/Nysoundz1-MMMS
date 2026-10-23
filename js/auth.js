// Authentication, Session State & Access Guard Controller
// School Mass Music Management System (SMMMS) - OLAG SHS

class SMMMSAuth {
  constructor() {
    this.init();
  }

  init() {
    // Ensure default users and store state are initialized
    if (typeof store !== 'undefined') {
      const current = store.getCurrentUser();
      if (!current && typeof DEFAULT_USERS !== 'undefined') {
        store.setCurrentUser(DEFAULT_USERS[0].id);
      }
    }
  }

  getCurrentUser() {
    if (typeof store !== 'undefined') {
      return store.getCurrentUser();
    }
    return null;
  }

  // Check access permissions for a protected page
  // expectedRole: 'chaplain' | 'coordinator' | 'group' | 'admin' | any
  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();

    // 1. Not logged in -> redirect to login.html
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }

    // 2. Account is Pending Approval -> redirect to pending.html
    if (user.status === 'pending') {
      const isPendingPage = window.location.pathname.endsWith('pending.html') || window.location.pathname.endsWith('/pending');
      if (!isPendingPage) {
        window.location.href = 'pending.html';
        return false;
      }
      return true;
    }

    // 3. Account is Rejected -> redirect to pending.html with rejected flag
    if (user.status === 'rejected') {
      const isPendingPage = window.location.pathname.endsWith('pending.html') || window.location.pathname.endsWith('/pending');
      if (!isPendingPage) {
        window.location.href = 'pending.html?status=rejected';
        return false;
      }
      return true;
    }

    // 4. If on pending page but already approved -> redirect to their role dashboard
    const isPendingPage = window.location.pathname.endsWith('pending.html') || window.location.pathname.endsWith('/pending');
    if (isPendingPage && user.status === 'approved') {
      this.redirectToUserDashboard(user);
      return false;
    }

    // 5. Verify allowed roles if specified (Admin can view all pages)
    if (allowedRoles && allowedRoles.length > 0 && user.role !== 'admin') {
      const hasPermission = allowedRoles.includes(user.role);
      if (!hasPermission) {
        this.redirectToUserDashboard(user);
        return false;
      }
    }

    return true;
  }

  // Redirect user to their dedicated dashboard file
  redirectToUserDashboard(user) {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    if (user.status === 'pending') {
      window.location.href = 'pending.html';
      return;
    }

    switch (user.role) {
      case 'chaplain':
        window.location.href = 'chaplain.html';
        break;
      case 'coordinator':
        window.location.href = 'coordinator.html';
        break;
      case 'admin':
        window.location.href = 'admin.html';
        break;
      case 'group':
      case 'student':
      default:
        window.location.href = 'group.html';
        break;
    }
  }

  // Login handler by user ID
  loginWithUserId(userId) {
    if (typeof store !== 'undefined') {
      const user = store.getUserById(userId);
      if (user) {
        store.setCurrentUser(user.id);
        this.redirectToUserDashboard(user);
        return user;
      }
    }
    return null;
  }

  // Login by Email & Password
  login(email, password) {
    if (typeof store !== 'undefined') {
      const users = store.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (user) {
        store.setCurrentUser(user.id);
        this.redirectToUserDashboard(user);
        return { success: true, user };
      }
    }
    return { success: false, message: 'Invalid credentials or user not registered.' };
  }

  // Register New User (Starts in Pending Status awaiting Admin approval)
  register(userData) {
    if (typeof store !== 'undefined') {
      const newUser = store.registerUser(userData);
      store.setCurrentUser(newUser.id);
      window.location.href = 'pending.html';
      return newUser;
    }
    return null;
  }

  // Logout handler
  logout() {
    if (confirm('Are you sure you want to sign out of OLAG SMMMS?')) {
      window.location.href = 'login.html';
    }
  }

  // Populate dynamic header user info across separate pages
  renderPageHeader(user) {
    if (!user) user = this.getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const avatarEl = document.getElementById('header-user-avatar');
    const statusBadgeEl = document.getElementById('header-user-status-badge');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = `${user.roleLabel} • ${user.groupName || 'Staff'}`;
    if (avatarEl && user.avatar) avatarEl.src = user.avatar;
    if (statusBadgeEl) {
      if (user.status === 'approved') {
        statusBadgeEl.textContent = 'Approved Active';
        statusBadgeEl.className = 'badge-pill badge-green';
      } else {
        statusBadgeEl.textContent = 'Pending Admin Approval ⏳';
        statusBadgeEl.className = 'badge-pill badge-orange';
      }
    }
  }
}

const auth = new SMMMSAuth();
