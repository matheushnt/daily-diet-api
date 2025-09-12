import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
})

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.listen({ port: 3333 }).then(() => console.log('HTTP Server Running!'))
