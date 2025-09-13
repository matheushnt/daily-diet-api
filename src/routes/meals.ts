import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.coerce.date(),
      isOnDiet: z.boolean(),
    })

    const { name, description, datetime, isOnDiet } = createMealBodySchema.parse(request.body)

    const mealId = randomUUID()

    const sessionId = request.cookies.sessionId

    const userBySessionId = await knex('users')
      .where('session_id', sessionId)
      .first()

    await knex('meals')
      .insert({
        id: mealId,
        name,
        description,
        is_on_diet: isOnDiet,
        datetime: datetime.getTime(),
        user_id: userBySessionId?.id,
      })

    return reply.status(201).send({ id: mealId })
  })

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId

    const userBySessionId = await knex('users')
      .where('session_id', sessionId)
      .first()

    const mealsUser = await knex('meals')
      .where('user_id', userBySessionId?.id)
      .select()

    return { meals: mealsUser }
  })

  app.get('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const getMealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const userBySessionId = await knex('users')
      .where('session_id', sessionId)
      .first()

    const mealUser = await knex('meals')
      .where({ id, user_id: userBySessionId?.id })
      .first()

    if (!mealUser) {
      return reply.status(404).send({ message: 'Meal not found.' })
    }

    return { meal: mealUser }
  })
}
