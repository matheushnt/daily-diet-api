import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const mealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.coerce.date(),
      isOnDiet: z.boolean(),
    })

    const { name, description, datetime, isOnDiet } = mealBodySchema.parse(request.body)

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

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const mealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = mealParamsSchema.parse(request.params)

    const mealUser = await knex('meals')
      .where('id', id)
      .first()

    if (!mealUser) {
      return reply.status(404).send({ message: 'Meal not found.' })
    }

    return { meal: mealUser }
  })

  app.put('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const mealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = mealParamsSchema.parse(request.params)

    const mealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.coerce.date(),
      isOnDiet: z.boolean(),
    })

    const { name, description, datetime, isOnDiet } = mealBodySchema.parse(request.body)

    const mealUser = await knex('meals')
      .where('id', id)
      .first()

    if (!mealUser) {
      return reply.status(404).send({ message: 'Meal not found.' })
    }

    await knex('meals')
      .where('id', id)
      .update({
        name,
        description,
        datetime: datetime.getTime(),
        is_on_diet: isOnDiet,
      })

    return reply.status(204).send()
  })

  app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const mealParamsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = mealParamsSchema.parse(request.params)

    const mealUser = await knex('meals')
      .where('id', id)
      .first()

    if (!mealUser) {
      return reply.status(404).send({ message: 'Meal not found.' })
    }

    await knex('meals')
      .where('id', id)
      .del()

    return reply.status(204).send()
  })

  app.get('/metrics', { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId

    const userBySessionId = await knex('users')
      .where('session_id', sessionId)
      .first()

    const totalMeals = await knex('meals')
      .count('* as total')
      .where('user_id', userBySessionId?.id)
      .first()

    const totalOnDiet = await knex('meals')
      .count('* as total')
      .where({
        is_on_diet: true,
        user_id: userBySessionId?.id,
      })
      .first()

    const totalOffDiet = await knex('meals')
      .count('* as total')
      .where({
        is_on_diet: false,
        user_id: userBySessionId?.id,
      })
      .first()

    const mealsUser = await knex('meals')
      .where('user_id', userBySessionId?.id)
      .orderBy('criated_at', 'asc')
      .select('is_on_diet')

    let currentSequence = 0
    let bestSequence = 0

    for (const meal of mealsUser) {
      if (meal.is_on_diet) {
        currentSequence++
        bestSequence = Math.max(currentSequence, bestSequence)
      } else {
        currentSequence = 0
      }
    }

    return { totalMeals, totalOnDiet, totalOffDiet, bestSequence }
  })
}
