import { useState } from 'react'

const NewBlogForm = ({ handleSubmit }) => {
  const [newBlog, setNewBlog] = useState({ title: '', author:  '', url:  '' })

  const createBlog = async (event) => {
    event.preventDefault()
    handleSubmit(newBlog)
    setNewBlog({ title: '', author: '', url: '' }) // Reset the form fields
  }

  return (
    <div>
      <h2>Create New Blog</h2>
      <form onSubmit={createBlog}>
        <div>
          Title:{' '}
          <input type='text' name='title' value={newBlog.title} id='title'
            onChange={({ target }) => setNewBlog({ ...newBlog, title: target.value })}/>
        </div>
        <div>
          Author:{' '}
          <input type='text' name='author' value={newBlog.author} id='author'
            onChange={({ target }) => setNewBlog({ ...newBlog, author: target.value })}/>
        </div>
        <div>
          URL:{' '}
          <input type='text' name='url' value={newBlog.url} id='url'
            onChange={({ target }) => setNewBlog({ ...newBlog, url: target.value })}/>
        </div>
        <button type='submit'>Create</button>
      </form>
    </div>
  )
}

export default NewBlogForm
