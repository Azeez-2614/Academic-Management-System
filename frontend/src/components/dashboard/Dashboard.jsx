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
      setError('Failed to load dashboard data. Please make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard metrics...</div>;
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <p>{error || 'No dashboard data available'}</p>
        <button className="btn btn-primary" onClick={loadDashboard}>Retry</button>
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

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{data.totalStudents ?? 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <span className="stat-label">Average Class Score</span>
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
            <span className="stat-label">Lowest Score</span>
            <span className="stat-value" style={{ fontSize: '1.15rem' }}>
              {lowestName || 'N/A'}
            </span>
            {lowestPct != null && (
              <span className="stat-sub">{Number(lowestPct).toFixed(1)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Student Academic Performance Summary */}
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
                          <strong>{avg != null ? `${Number(avg).toFixed(1)}%` : 'No Marks'}</strong>
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
              <p>No students found. Add your first student to see academic summaries.</p>
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
