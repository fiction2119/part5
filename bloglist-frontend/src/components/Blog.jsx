import React from "react"
import Togglable from "./Togglable"
import blogService from "../services/blogs"

const Blog = ({ blog, currentUser, setNotification, setBlogs }) => {
  const NOTIFICATION_DURATION = 3500

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 2,
    marginBottom: 5,
  }

  const handleLike = async () => {
    try {
      const blogs = await blogService.getAll()
      const blogToUpdate = blogs.find((b) => b.id === blog.id)
      const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }
      await blogService.update(blogToUpdate.id, updatedBlog)
      const updatedBlogs = await blogService.getAll()
      const sortedUpdatedBlogs = updatedBlogs.sort((a, b) => b.likes - a.likes)
      setBlogs(sortedUpdatedBlogs)
      setNotification("Blog liked successfully.")
      setTimeout(() => setNotification(null), NOTIFICATION_DURATION)
    } catch (error) {
      setNotification("Failed to like blog")
      setTimeout(() => setNotification(null), NOTIFICATION_DURATION)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Delete ${blog.title.trim()} by ${blog.author}?`)) {
      try {
        console.log(blog.id)
        await blogService.del(blog.id)
        const updatedBlogs = await blogService.getAll()
        const sortedUpdatedBlogs = updatedBlogs.sort(
          (a, b) => b.likes - a.likes
        )
        setBlogs(sortedUpdatedBlogs)
        setNotification("Blog deleted successfully.")
        setTimeout(() => setNotification(null), NOTIFICATION_DURATION)
      } catch (error) {
        setNotification("Failed to delete blog")
        setTimeout(() => setNotification(null), NOTIFICATION_DURATION)
      }
    }
  }
  const isCreator = blog.user.username === currentUser.username

  return (
    <div style={blogStyle} data-testid='blog-div'>
      <h3 data-testid='blog-id'>
        {blog.title.trim()} by {blog.author}
        {isCreator && (
          <button onClick={handleDelete} data-testid='delete-blog'>
            Delete
          </button>
        )}
      </h3>
      <Togglable buttonLabel='view' data-testid='view-blog'>
        {blog.url && <h3>URL: {blog.url}</h3>}
        <h3 data-testid='likes-id'>
          Likes: {blog.likes}{" "}
          <button onClick={handleLike} data-testid='like-blog'>
            Like
          </button>
        </h3>
        <h3>Posted by: {blog.user.username}</h3>
      </Togglable>
    </div>
  )
}

export default Blog
