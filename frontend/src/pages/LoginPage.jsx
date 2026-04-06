import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // This hits the path you defined in your urls.py
            const response = await axios.post('http://127.0.0.1:8000/api/token/', credentials);

            // Store the "Access Token" so api.js can use it later
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);

            // Redirect to Dashboard
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Threat Intel Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" name="username" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" onChange={handleChange} required style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
            </form>
        </div>
    );
};

export default Login;
