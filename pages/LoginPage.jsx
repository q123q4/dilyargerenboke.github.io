import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        username,
        password
      });

      // 保存登录信息到本地存储
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username);
      localStorage.setItem('isAdmin', response.isAdmin);

      // 登录成功后跳转到管理后台
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || '登录失败，请检查用户名和密码');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: 'var(--font-cursive)' }}>
        登录管理后台
      </h1>
      
      {error && (
        <div style={{ 
          backgroundColor: 'var(--danger-color)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">用户名:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="password">密码:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      
      <p style={{ 
        textAlign: 'center', 
        marginTop: '1.5rem', 
        color: 'var(--text-secondary)' 
      }}>
        提示: 第一个登录的用户将成为管理员
      </p>
    </div>
  );
}

export default LoginPage;