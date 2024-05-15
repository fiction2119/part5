import { useState, useEffect, useRef } from "react"
import Blog from "./components/Blog"
import LoginForm from "./components/LoginForm"
import BlogForm from "./components/BlogForm"
import Notification from "./components/Notification"
import Togglable from "./components/Togglable"
import blogService from "./services/blogs"
import loginService from "./services/login"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    title: "",
    author: "",
    url: "",
  })
  const [notification, setNotification] = useState(null)
  const blogFormRef = useRef()
  const NOTIFICATION_DURATION = 3500

  useEffect(loadInitialBlogs, [])
  useEffect(restoreSession, [])

  function loadInitialBlogs() {
    const fetchData = async () => {
      const initialBlogs = await blogService.getAll()
      const sortInitialBlogs = initialBlogs.sort((a, b) => b.likes - a.likes)
      setBlogs(sortInitialBlogs)
    }
    fetchData()
  }

  function restoreSession() {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username: formData.username,
        password: formData.password,
      })
      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user))
      setUser(user)
      blogService.setToken(user.token)
      setNotification("Logged in successfully.")
    } catch (exception) {
      setNotification("Wrong credentials.")
    } finally {
      setTimeout(() => setNotification(null), NOTIFICATION_DURATION)
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("loggedBlogappUser")
    setUser(null)
    blogService.setToken(null)
    setNotification("Logged out successfully.")
    setTimeout(() => setNotification(null), NOTIFICATION_DURATION)
  }

  return (
    <div>
      <h1>blogs</h1>
      {notification && <Notification message={notification} />}

      {!user ? (
        <LoginForm
          value={formData}
          handleChange={handleChange}
          handleLogin={handleLogin}
        />
      ) : (
        <div>
          <p data-testid='userlogged-id'>
            {user.username} logged in{" "}
            <button onClick={handleLogout} data-testid='logout-button'>
              logout
            </button>
          </p>
          <Togglable
            buttonLabel='add blog'
            ref={blogFormRef}
            data-testid='add-blog'
          >
            <BlogForm
              formData={formData}
              setFormData={setFormData}
              blogs={blogs}
              setBlogs={setBlogs}
              handleChange={handleChange}
              setNotification={setNotification}
              blogFormRef={blogFormRef}
            />
          </Togglable>

          <ul>
            {blogs.map((blog, index) => (
              <Blog
                key={index}
                blog={blog}
                setNotification={setNotification}
                setBlogs={setBlogs}
                currentUser={user}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App
