import React from "react"
import PropTypes from "prop-types"
import blogService from "../services/blogs"

const BlogForm = ({
  formData,
  setBlogs,
  blogs,
  setNotification,
  setFormData,
  handleChange,
  blogFormRef,
}) => {
  const NOTIFICATION_TIMEOUT = 3500

  const addBlog = async (event) => {
    event.preventDefault()
    try {
      const blogObject = {
        title: formData.title,
        author: formData.author,
        url: formData.url,
      }

      const returnedBlog = await blogService.create(blogObject)
      const updatedBlogsObject = blogs.concat(returnedBlog)
      const sortedBlogs = updatedBlogsObject.sort((a, b) => b.likes - a.likes)

      setBlogs(sortedBlogs)

      setNotification("Blog added successfully")
      blogFormRef.current.toggleVisibility()

      setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT)
    } catch (error) {
      setNotification(`Failed to add blog: ${error.message}`)
      setTimeout(() => setNotification(null), NOTIFICATION_TIMEOUT)
    }

    setFormData({
      title: "",
      author: "",
      url: "",
    })
  }

  return (
    <form onSubmit={addBlog}>
      <h2>Create a new blog</h2>
      <input
        data-testid='title'
        type='text'
        name='title'
        value={formData.title}
        onChange={handleChange}
        placeholder='Title'
      />
      <input
        data-testid='author'
        type='text'
        name='author'
        value={formData.author}
        onChange={handleChange}
        placeholder='Author'
      />
      <input
        data-testid='url'
        type='text'
        name='url'
        value={formData.url}
        onChange={handleChange}
        placeholder='URL'
      />
      <button type='submit' data-testid='create-blog-button'>
        Add Blog
      </button>
    </form>
  )
}

BlogForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setBlogs: PropTypes.func.isRequired,
  blogs: PropTypes.array.isRequired,
  setNotification: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  blogFormRef: PropTypes.object.isRequired,
}

export default BlogForm
