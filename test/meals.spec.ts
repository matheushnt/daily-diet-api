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
    const createUser = await request(app.server)
      .post('/users')
      .send({
        name: 'Vitor Santos',
        email: 'vitorsantos@exmaple.com',
      })

    const cookie = createUser.get('Set-Cookie')

    const response = await request(app.server)
      .post('/meals')
      .set('Cookie', cookie ?? [])
      .send({
        name: 'Salada de fruta',
        description: 'Durante o almoço, comi uma salada de fruta',
        isOnDiet: true,
        datetime: new Date(),
      })

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual({
      id: expect.any(String),
    })
  })

  it('should be able to get list all meals from a user', async () => {
    const createUser = await request(app.server)
      .post('/users')
      .send({
        name: 'Vitor Santos',
        email: 'vitorsantos@exmaple.com',
      })
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

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

    const getMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie ?? [])
      .expect(200)

    expect(getMeals.body.meals).toHaveLength(2)
  })
})
