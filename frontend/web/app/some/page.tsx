'use client';

import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const SomeComponent = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setError('Please sign in to access data');
      } else {
        currentUser.getIdToken().then((token) => {
          console.log('ID Token:', token);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAllFirestoreData = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const getAllFirestoreData = httpsCallable(functions, 'get_all_firestore_data');
      const result = await getAllFirestoreData();
      console.log('get_all_firestore_data:', result.data);
      if (result.data.status === 'success') {
        setSummaries(result.data.data.summaries || []);
      } else {
        setError(result.data.error || 'Failed to fetch summaries');
      }
    } catch (err: any) {
      console.error('Error fetching summaries:', err);
      setError(`Error fetching summaries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const manageReports = httpsCallable(functions, 'manage_reports');
      const result = await manageReports({ method: 'GET' });
      console.log('manage_reports:', result.data);
      if (result.data.status === 'success') {
        setReports(result.data.reports || []);
      } else {
        setError(result.data.error || 'Failed to fetch reports');
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(`Error fetching reports: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Dashboard</h2>
      {!user && <p>Please sign in to access the dashboard.</p>}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchAllFirestoreData}
          disabled={loading || !user}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: loading || !user ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || !user ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Fetch RCA Summaries'}
        </button>
        <button
          onClick={fetchReports}
          disabled={loading || !user}
          style={{
            padding: '10px 20px',
            backgroundColor: loading || !user ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || !user ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Fetch Reports'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div>
        <h3>RCA Summaries</h3>
        {summaries.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {summaries.map((summary) => (
              <li
                key={summary.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <p><strong>ID:</strong> {summary.id}</p>
                <p><strong>Summary:</strong> {summary.summary}</p>
                <p><strong>Incident Overlap:</strong> {summary.incident_overlap}</p>
                <p><strong>User Impact:</strong> {summary.user_impact}</p>
                <p><strong>Confidence Score:</strong> {summary.confidence_score}</p>
                <p><strong>Suggestions:</strong> {summary.suggestions.join(', ')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No summaries available.</p>
        )}
      </div>

      <div>
        <h3>Reports</h3>
        {reports.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {reports.map((report) => (
              <li
                key={report.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <p><strong>ID:</strong> {report.id}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Type:</strong> {report.reportType}</p>
                <p><strong>Status:</strong> {report.status}</p>
                <p><strong>Timestamp:</strong> {report.timestamp}</p>
                {report.mediaUrl && (
                  <p>
                    <strong>Media:</strong>{' '}
                    <a href={report.mediaUrl} target="_blank" rel="noopener noreferrer">
                      View Media
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reports available.</p>
        )}
      </div>
    </div>
  );
};

export default SomeComponent;
