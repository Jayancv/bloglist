const app = require('./server/app')
const config = require('./server/utils/config')
const logger = require('./server/utils/logger')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})