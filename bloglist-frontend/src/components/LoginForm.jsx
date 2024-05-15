const LoginForm = ({ value, handleChange, handleLogin }) => (
  <form onSubmit={handleLogin}>
    <div>
      username
      <input
        type='text'
        data-testid='username'
        value={value.username}
        name='username'
        onChange={handleChange}
      />
    </div>
    <div>
      password
      <input
        type='password'
        data-testid='password'
        value={value.password}
        name='password'
        onChange={handleChange}
      />
    </div>
    <button type='submit' data-testid='login-button'>
      login
    </button>
  </form>
)

export default LoginForm
