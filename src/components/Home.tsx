import React from 'react';

const logout = () => {
    localStorage.removeItem('token'); // Remove the token
    window.location.href = '/login'; // Redirect to login
  };

const Home: React.FC = () => {
  return (
    <div>
      <header>
        <h1>Welcome, User!</h1>
      </header>
      <main>
        <p>Here you can view your dashboard, manage settings, and more.</p>
        <button onClick={logout}>Logout</button>
      </main>
    </div>
  );
};

export default Home;
