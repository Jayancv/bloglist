const express = require('express')
const jwt = require('jsonwebtoken')


const Blog = require('../models/blog')
const User = require('../models/user')
const router = express.Router()


// moved to utils/middleware.js
// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
//     return authorization.substring(7)
//   }
//   return null
// }


router.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(blogs)
})

router.post('/', async (request, response) => {

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const userId = decodedToken.id
  if (!userId) {
    return response.status(401).json({ error: 'user not found' })
  }

  let user = await User.findById(userId)
  // if (!user) {
  //   user = await User.find({}).findOne() // Fallback to any user if userId is not provided
  // }
  if (!user) {
    return response.status(400).json({ error: 'User not found' })
  }
  const blog = new Blog(request.body)
  blog.user = user._id
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

router.delete('/:id', async (request, response) => {
  const { id } = request.params

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const userId = decodedToken.id
  if (!userId) {
    return response.status(401).json({ error: 'user not found' })
  }
  const user = await User.findById(userId)
  if (!user) {
    return response.status(401).json({ error: 'user not found' })
  }
  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'You do not have permission to delete this blog' })
  }

  await Blog.findByIdAndDelete(id)
  response.status(204).end()
})

router.put('/:id', async (request, response) => {
  const { id } = request.params
  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    request.body,
    { new: true, runValidators: true, context: 'query' }
  )
  response.json(updatedBlog)
})


module.exports = router