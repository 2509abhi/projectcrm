import React from "react";
const Login = () => {
  const signInWithGoogle = () => {
    window.location.href = "https://projectcrm-dgrs.onrender.com/auth/google";
    // window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="/">
          AlwaysLearn
        </a>
      </nav>
      <div className="login-container">
        <div className="login-card">
          <h2>Login</h2>
          <button className="btn login-button" onClick={signInWithGoogle}>
            <i className="fab fa-google"></i> Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
