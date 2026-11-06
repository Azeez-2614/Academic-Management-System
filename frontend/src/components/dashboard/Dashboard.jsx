import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaChartLine,
  FaTrophy,
  FaArrowDown,
  FaPlus,
  FaBookOpen,
  FaGraduationCap,
} from 'react-icons/fa';
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
      const msg = err.userMessage || 'Failed to load dashboard metrics from backend server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading institutional academic metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <p className="error-text">{error || 'No dashboard data available'}</p>
        <button className="btn btn-primary" onClick={loadDashboard} style={{ marginTop: '1rem' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  const getGradeBadgeClass = (grade) => {
    if (!grade || grade === 'N/A') return 'badge badge-neutral';
    if (grade.startsWith('A')) return 'badge badge-a';
    if (grade.startsWith('B')) return 'badge badge-b';
    if (grade.startsWith('C') || grade.startsWith('D')) return 'badge badge-c';
    return 'badge badge-f';
  };

  const highestName = data.highestScorer?.fullName || data.highestScorer?.name;
  const highestPct = data.highestScorer?.averagePercentage ?? data.highestScorer?.percentage;

  const lowestName = data.lowestScorer?.fullName || data.lowestScorer?.name;
  const lowestPct = data.lowestScorer?.averagePercentage ?? data.lowestScorer?.percentage;

  const summaryStudents = data.performanceSummary || data.students || [];
  const subjectAverages = data.subjectAverages || [];
  const gradeDistribution = data.gradeDistribution || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="text-muted">Academic performance overview, batch analytics, and student records</p>
        </div>
        <Link to="/students/new" className="btn btn-primary">
          <FaPlus /> Register Student
        </Link>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Enrolled</span>
            <span className="stat-value">{data.totalStudents ?? 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <span className="stat-label">Class Average</span>
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
            <span className="stat-label">Top Performer</span>
            <span className="stat-value" style={{ fontSize: '1.15rem' }}>
              {highestName || 'N/A'}
            </span>
            {highestPct != null && (
              <span className="stat-sub">{Number(highestPct).toFixed(1)}%</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FaArrowDown />
          </div>
          <div className="stat-info">
            <span className="stat-label">Lowest Scorer</span>
            <span className="stat-value" style={{ fontSize: '1.15rem' }}>
              {lowestName || 'N/A'}
            </span>
            {lowestPct != null && (
              <span className="stat-sub">{Number(lowestPct).toFixed(1)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Row: Subject Averages & Grade Distribution */}
      <div className="analytics-grid">
        {/* Subject-Wise Averages Card */}
        <div className="card">
          <div className="card-header">
            <h3><FaBookOpen style={{ marginRight: '0.5rem', color: 'var(--primary)' }} /> Subject Performance Averages</h3>
          </div>
          <div className="card-body">
            {subjectAverages.length > 0 ? (
              <div className="subject-bars-list">
                {subjectAverages.map((sub) => {
                  const pct = Math.min(100, Math.max(0, sub.averagePercentage || 0));
                  return (
                    <div key={sub.subject} className="subject-bar-item">
                      <div className="subject-bar-header">
                        <span className="subject-name">{sub.subject}</span>
                        <span className="subject-pct">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 80 ? '#10b981' : pct >= 60 ? '#4f46e5' : pct >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>
                No subject examination data recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Grade Distribution Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <h3><FaGraduationCap style={{ marginRight: '0.5rem', color: 'var(--primary)' }} /> Grade Distribution</h3>
          </div>
          <div className="card-body">
            {Object.keys(gradeDistribution).length > 0 ? (
              <div className="grade-pills-grid">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="grade-pill-item">
                    <span className={`badge ${grade.startsWith('A') ? 'badge-a' : grade.startsWith('B') ? 'badge-b' : grade === 'F' ? 'badge-f' : 'badge-c'}`}>
                      {grade}
                    </span>
                    <span className="grade-count">{count} Students</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>
                Grade distributions will appear once marks are added.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Student Academic Performance Summary Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <div>
            <h2>Academic Performance Summary</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Aggregated results and automated grading per registered student
            </p>
          </div>
          <Link to="/students" className="btn btn-outline btn-sm">
            View All Students
          </Link>
        </div>

        <div className="card-body">
          {summaryStudents.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Class / Department</th>
                    <th>Average Score</th>
                    <th>Grade</th>
                    <th>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryStudents.map((student) => {
                    const avg = student.averagePercentage != null ? student.averagePercentage : student.avg;
                    const grade = student.grade || 'N/A';
                    return (
                      <tr key={student.id}>
                        <td>
                          <span className="badge badge-neutral">
                            {student.studentId}
                          </span>
                        </td>
                        <td>
                          <Link to={`/students/${student.id}`} className="student-name-link">
                            <strong>{student.fullName || student.name}</strong>
                          </Link>
                        </td>
                        <td>{student.className || '—'}</td>
                        <td>
                          <strong>{avg != null ? `${Number(avg).toFixed(1)}%` : 'No Records'}</strong>
                        </td>
                        <td>
                          <span className={getGradeBadgeClass(grade)}>{grade}</span>
                        </td>
                        <td>
                          <Link to={`/students/${student.id}`} className="btn btn-outline btn-sm">
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No students found. Register your first student to see academic summaries.</p>
              <Link to="/students/new" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Register Student
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
