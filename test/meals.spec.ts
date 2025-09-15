import { it, describe, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Vitor Santos',
        email: 'vitorsantos@exmaple.com',
      })

    const cookie = createUserResponse.get('Set-Cookie')

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Salada de fruta',
        description: 'Durante o almoço, comi uma salada de fruta',
        isOnDiet: true,
        datetime: new Date(),
      })

    expect(createMealResponse.statusCode).toEqual(201)
    expect(createMealResponse.body).toEqual({
      id: expect.any(String),
    })
  })

  it('should be able to get list all meals from a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Vitor Santos',
        email: 'vitorsantos@exmaple.com',
      })
      .expect(201)

    const cookie = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Salada de fruta',
        description: 'Durante o almoço, comi uma salada de fruta',
        isOnDiet: true,
        datetime: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Salada de maionese',
        description: 'Durante o almoço, comi uma salada de maionese',
        isOnDiet: true,
        datetime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Um dia depois
      })
      .expect(201)

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie ?? [])
      .expect(200)

    expect(getMealsResponse.body.meals).toHaveLength(2)
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Vitor Santos',
        email: 'vitorsantos@exmaple.com',
      })
      .expect(201)

    const cookie = createUserResponse.get('Set-Cookie')

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Salada de fruta',
        description: 'Durante o almoço, comi uma salada de fruta',
        isOnDiet: true,
        datetime: new Date(),
      })
      .expect(201)

    const { id: mealId } = createMealResponse.body

    const getMealByIdResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie ?? [])
      .expect(200)

    console.log(getMealByIdResponse.body.meal.id, mealId)

    expect(getMealByIdResponse.body.meal.id).toEqual(mealId)
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Vitor Santos',
        email: 'vitorsantos@exmaple.com',
      })
      .expect(201)

    const cookie = createUserResponse.get('Set-Cookie')

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Salada de fruta',
        description: 'Durante o almoço, comi uma salada de fruta',
        isOnDiet: true,
        datetime: new Date(),
      })
      .expect(201)

    const { id: mealId } = createMealResponse.body

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Torta de limão',
        description: 'Comi uma torta de limão com a minha vó',
        isOnDiet: false,
        datetime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Um dia depois
      })

    const getMealByIdResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie ?? [])
      .expect(200)

    expect(getMealByIdResponse.body.meal).toHaveProperty('name', 'Torta de limão')
    expect(getMealByIdResponse.body.meal).toHaveProperty('description', 'Comi uma torta de limão com a minha vó')
  })
})
