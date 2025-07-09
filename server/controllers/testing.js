const express = require('express')

const Blog = require('../models/blog')
const User = require('../models/user')
const router = express.Router()

router.post('/reset', async (request, response) => {
  // Reset the database by deleting all blogs and users
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = router