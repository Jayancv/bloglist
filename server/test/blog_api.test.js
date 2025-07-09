const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const testHelper = require('./test_helper')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const users = await User.find({})
  if (users.length === 0) {
    await User.insertMany(testHelper.rootUser)
  }
  else {
    await User.findOne({ username: 'root' }).then(async user => {
      if (!user) {
        const passwordHash = await bcrypt.hash('salainen', 10)
        const newUser = new User({ username: 'root', name: 'Superuser', passwordHash })
        await newUser.save()
      }
    })
  }
  const dummyUser = await User.findOne({ username: 'dummy' })
  if (!dummyUser) {
    const passwordHash = await bcrypt.hash('salainen', 10)
    const dummyUser = new User({ username: 'dummy', name: 'Dummy User', passwordHash, })
    await dummyUser.save()
  }
  const user1 = await User.find({}).then(users => users[0])
  const user2 = await User.find({}).then(users => users[1])

  const blogs = testHelper.initialBlogs.map(blog => {
    return { ...blog, user: user1.id.toString() }
  })
  blogs[1].user = user2.id.toString() // Ensure the second blog is linked to user2
  // Insert initial blogs only if the collection is empty
  await Blog.insertMany(blogs)
})

describe('Blog API get blogs test', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, testHelper.initialBlogs.length)
  })

  test('a specific blog is returned', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map((blog) => blog.title)
    assert.deepStrictEqual(titles.includes('React patterns'), true)
  })

  test('blogs have an id property', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      assert.ok(blog.id)
    })
  })

  test('blogs have unique ids', async () => {
    const response = await api.get('/api/blogs')
    const ids = response.body.map((blog) => blog.id)
    const uniqueIds = new Set(ids)
    assert.strictEqual(uniqueIds.size, ids.length)
  })
})

describe('Blog API post blogs test', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New Blog',
      author: 'James Smith',
      url: 'https://wikipedia.org/wiki/New_Blog',
      likes: 1,
    }

    const user = await testHelper.usersInDb().then(users => users[0])
    const token = await testHelper.getTokenFromUser(user)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, testHelper.initialBlogs.length + 1)
    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(titles.includes('New Blog'))
  })

  test('if likes is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'New Blog Without Likes',
      author: 'James Smith',
      url: 'https://wikipedia.org/wiki/New_Blog',
    }

    const user = await testHelper.usersInDb().then(users => users[0])
    const token = await testHelper.getTokenFromUser(user)
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, testHelper.initialBlogs.length + 1)
    const newBlogDB = blogsAtEnd.find(
      (blog) => blog.title === 'New Blog Without Likes'
    )
    assert.ok(newBlogDB)
    assert.strictEqual(newBlogDB.likes, 0)
  })

  test('blog without title is not added', async () => {
    const titleMissing = {
      author: 'James Smith',
      url: 'https://wikipedia.org/wiki/New_Blog',
      likes: 1,
    }

    const user = await testHelper.usersInDb().then(users => users[0])
    const token = await testHelper.getTokenFromUser(user)

    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(titleMissing).expect(400)
    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, testHelper.initialBlogs.length)
  })

  test('blog without url is not added', async () => {
    const urlMissing = {
      title: 'New Blog Without URL',
      author: 'James Smith',
      likes: 1,
    }

    const user = await testHelper.usersInDb().then(users => users[0])
    const token = await testHelper.getTokenFromUser(user)
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(urlMissing).expect(400)
    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, testHelper.initialBlogs.length)
  })
})


describe('Blog API delete blogs test', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    const user = await testHelper.usersInDb().then(users => users[0])
    const token = await testHelper.getTokenFromUser(user)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  test('deleting a non-existing blog returns 404', async () => {

    const user = await testHelper.usersInDb().then(users => users[0])
    const token = await testHelper.getTokenFromUser(user)

    const nonExistingId = await testHelper.nonExistingId()
    console.log(`Testing deletion of non-existing blog with id: ${nonExistingId}`)
    await api.delete(`/api/blogs/${nonExistingId}`).set('Authorization', `Bearer ${token}`).expect(404)
  })

  test('deleting a blog without authorization returns 401', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('deleting a blog with invalid token returns 401', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('deleting a blog with same user returns 204', async () => {
    const blogsAtStart = await Blog.find({})
    const user = await testHelper.usersInDb().then(users => users[1])
    const blogToDelete = blogsAtStart.find(blog => blog.user.toString() === user.id.toString())
    const token = await testHelper.getTokenFromUser(user)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length-1)
  })

  test('deleting a blog with other user returns 401', async () => {
    const blogsAtStart = await Blog.find({})
    const user = await testHelper.usersInDb().then(users => users[1])
    const blogToDelete = blogsAtStart.find(blog => blog.user.toString() !== user.id.toString())
    const token = await testHelper.getTokenFromUser(user)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })
})


describe('Blog API update blogs test', () => {
  test('a blog can be updated', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = { ...blogToUpdate.toObject(), likes: blogToUpdate.likes + 1 }

    // log(updatedBlog)
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, updatedBlog.likes)

    const blogsAtEnd = await Blog.find({})
    const updatedBlogDB = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
    assert.ok(updatedBlogDB)
    assert.strictEqual(updatedBlogDB.likes, updatedBlog.likes)
  })

  test('updating a non-existing blog returns 404', async () => {
    const nonExistingId = await testHelper.nonExistingId()
    const updatedBlog = { title: 'Updated Blog', likes: 5 }

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send(updatedBlog)
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
  console.log('Connection to MongoDB closed')
})
