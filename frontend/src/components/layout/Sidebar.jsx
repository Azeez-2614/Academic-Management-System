import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaGraduationCap, FaChartBar, FaUsers, FaUserPlus } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <FaGraduationCap size={28} />
        <span>Student Manager</span>
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
    </aside>
  );
}
