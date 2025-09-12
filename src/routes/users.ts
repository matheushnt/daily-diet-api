import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserSchemaBody = z.object({
      name: z.string(),
      email: z.email(),
    })

    const { name, email } = createUserSchemaBody.parse(request.body)

    const userEmail = await knex('users')
      .where('email', email)
      .first()

    if (userEmail) {
      return reply.status(409).send({ message: 'User already exists' })
    }

    const userId = randomUUID()

    await knex('users').insert({
      id: userId,
      name,
      email,
    })

    return reply.status(201).send({ id: userId })
  })
}
