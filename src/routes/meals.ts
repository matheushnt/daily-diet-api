import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.coerce.date(),
      isOnDiet: z.boolean(),
    })

    const { name, description, datetime, isOnDiet } = createMealBodySchema.parse(request.body)

    const mealId = randomUUID()

    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send({ message: 'Unauthorized.' })
    }

    const userBySessionId = await knex('users')
      .where('session_id', sessionId)
      .first()

    await knex('meals')
      .insert({
        id: mealId,
        name,
        description,
        is_on_diet: isOnDiet,
        datetime,
        user_id: userBySessionId?.id,
      })

    return reply.status(201).send({ id: mealId })
  })
}
