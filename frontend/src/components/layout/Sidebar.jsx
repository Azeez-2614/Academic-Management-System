import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGraduationCap, FaChartBar, FaUsers, FaUserPlus, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <FaGraduationCap size={28} />
        <span>Academic Manager</span>
      </div>

      <nav>
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <FaChartBar />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/students" end className={({ isActive }) => (isActive ? 'active' : '')}>
          <FaUsers />
          <span>Students</span>
        </NavLink>
        <NavLink to="/students/new" className={({ isActive }) => (isActive ? 'active' : '')}>
          <FaUserPlus />
          <span>Add Student</span>
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">
              <FaUserShield />
            </div>
            <div className="user-info">
              <span className="user-name">{user.fullName || user.username}</span>
              <span className="user-role">
                {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Teacher'}
              </span>
            </div>
          </div>
          <button type="button" className="sidebar-logout-btn" onClick={logout} title="Sign Out">
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
