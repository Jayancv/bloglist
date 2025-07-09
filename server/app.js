const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blog')
const usersRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')

const app = express()

const path = require('path')
const cors = require('cors')
app.use(cors())
app.use(express.json())

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.get('/version', (req, res) => {
  res.send('1')  // change this string to ensure a new version deployed
})

app.get('/health', (req, res) => {
  res.send('ok')
})

// Frontend page
const DIST_PATH = path.resolve(__dirname, '../client/dist')
const INDEX_PATH = path.resolve(DIST_PATH, 'index.html')

app.use(express.static(DIST_PATH))
app.get('/', (req, res) => res.sendFile(INDEX_PATH))

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app