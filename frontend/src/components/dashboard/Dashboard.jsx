import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartLine, FaTrophy, FaArrowDown, FaPlus } from 'react-icons/fa';
import { fetchDashboard } from '../../api/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDashboard();
      setData(response.data);
    } catch (err) {
      setError('Unable to connect to the backend server. Make sure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <p className="error-text">{error || 'No dashboard data available.'}</p>
        <button type="button" className="btn btn-primary" onClick={loadDashboard} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const getGradeBadge = (grade) => {
    if (!grade || grade === 'N/A') return <span className="badge badge-neutral">No Marks</span>;
    if (grade.startsWith('A')) return <span className="badge badge-a">{grade}</span>;
    if (grade.startsWith('B')) return <span className="badge badge-b">{grade}</span>;
    if (grade.startsWith('C') || grade.startsWith('D')) return <span className="badge badge-c">{grade}</span>;
    return <span className="badge badge-f">{grade}</span>;
  };

  const highestName = data.highestScorer?.fullName;
  const highestScore = data.highestScorer?.averagePercentage;

  const lowestName = data.lowestScorer?.fullName;
  const lowestScore = data.lowestScorer?.averagePercentage;

  const studentSummaries = data.performanceSummary || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="text-muted">Overview of student performance and examination results</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">
          <FaPlus /> Add Student
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{data.totalStudents || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <span className="stat-label">Average Marks</span>
            <span className="stat-value">
              {data.averagePercentage != null ? `${Number(data.averagePercentage).toFixed(1)}%` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <FaTrophy />
          </div>
          <div className="stat-info">
            <span className="stat-label">Highest Score</span>
            <span className="stat-value" style={{ fontSize: '1.2rem' }}>
              {highestName || 'N/A'}
            </span>
            {highestScore != null && (
              <span className="stat-sub">{Number(highestScore).toFixed(1)}%</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FaArrowDown />
          </div>
          <div className="stat-info">
            <span className="stat-label">Lowest Score</span>
            <span className="stat-value" style={{ fontSize: '1.2rem' }}>
              {lowestName || 'N/A'}
            </span>
            {lowestScore != null && (
              <span className="stat-sub">{Number(lowestScore).toFixed(1)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Student Performance Summary Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>Student Performance Summary</h2>
          <Link to="/students" className="btn btn-outline btn-sm">
            View All Students
          </Link>
        </div>

        <div className="card-body">
          {studentSummaries.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Class / Dept</th>
                    <th>Average Score</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSummaries.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className="badge badge-neutral">{s.studentId}</span>
                      </td>
                      <td>
                        <Link to={`/students/${s.id}`} className="student-name-link">
                          <strong>{s.fullName}</strong>
                        </Link>
                      </td>
                      <td>{s.className || '—'}</td>
                      <td>
                        {s.averagePercentage != null ? `${Number(s.averagePercentage).toFixed(1)}%` : 'No Marks'}
                      </td>
                      <td>{getGradeBadge(s.grade)}</td>
                      <td>
                        <Link to={`/students/${s.id}`} className="btn btn-outline btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No students found. Register your first student to get started.</p>
              <Link to="/students/new" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                <FaPlus /> Add Student
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
