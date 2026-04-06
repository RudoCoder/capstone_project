import React, { useEffect, useState } from 'react';
import { getAnalysisResults, getTutorials } from '../services/api';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [results, setResults] = useState([]);
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Analysis Results for the table
                const analysisRes = await getAnalysisResults();
                setResults(analysisRes.data);

                // 2. Fetch Tutorials from Django
                const tutorialRes = await getTutorials();
                setTutorials(tutorialRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10">Loading Threat Intel Data...</div>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            {/* --- SIDEBAR NAVIGATION --- */}
            <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
                <h2 style={{ marginBottom: '30px' }}>Shanduko Intel</h2>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '15px' }}><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>📊 Dashboard</Link></li>
                        <li style={{ marginBottom: '15px' }}><Link to="/upload" style={{ color: 'white', textDecoration: 'none' }}>📁 Upload File</Link></li>
                        <li style={{ marginBottom: '15px' }}><Link to="/tutorials" style={{ color: 'white', textDecoration: 'none' }}>📚 Tutorials</Link></li>
                        <li style={{ marginTop: '50px' }}><button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={{ background: 'none', border: '1px solid white', color: 'white', cursor: 'pointer', padding: '5px 10px' }}>Logout</button></li>
                    </ul>
                </nav>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <h1>Security Overview</h1>
                    <Link to="/upload" style={{ backgroundColor: '#3498db', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>
                        + New Scan
                    </Link>
                </header>

                {/* --- CHART SECTION (Fixed Height Fix) --- */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h3>Threat Level Trend</h3>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="created_at" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="risk_score" stroke="#e74c3c" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                    {/* --- RECENT ANALYSIS TABLE --- */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <h3>Recent File Scans</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>File Name</th>
                                    <th>Status</th>
                                    <th>Risk</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{item.file_name}</td>
                                        <td><span style={{ color: item.status === 'Completed' ? 'green' : 'orange' }}>{item.status}</span></td>
                                        <td>{item.risk_score}/100</td>
                                        <td><Link to={`/analysis/${item.id}`} style={{ color: '#3498db' }}>View Details</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- TUTORIALS SECTION (Linking to your Youtube/Drive links) --- */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                        <h3>Learning Hub</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>Cybersecurity resources</p>
                        <div style={{ marginTop: '15px' }}>
                            {tutorials.length > 0 ? tutorials.map((tut) => (
                                <div key={tut.id} style={{ marginBottom: '15px', padding: '10px', borderLeft: '4px solid #3498db', backgroundColor: '#f9f9f9' }}>
                                    <h4 style={{ margin: 0 }}>{tut.title}</h4>
                                    <a
                                        href={tut.link_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '0.85rem', color: '#2980b9', textDecoration: 'none', fontWeight: 'bold' }}
                                    >
                                        Click to Open Link →
                                    </a>
                                </div>
                            )) : <p>No tutorials found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
