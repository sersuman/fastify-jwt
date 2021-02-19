const fastify = require('fastify') ({
    logger: true
})
const jwt = require('fastify-jwt')

fastify.register(jwt, {
    secret: 'secret',
    cookie: {
        cookieName: 'token'
    }
})

fastify.register(require('fastify-cookie'))

fastify.get('/cookies', async (request, reply) => {
    const token = await reply.jwtSign({
        name: 'foo',
        role: ['admin','spy']
    })

    reply.setCookie('token', token, {
        domain: '*',
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: true
    })
    .code (200)
    .send('Cookie sent')
})

fastify.get('/verifycookie', async (request, reply) =>{
    try {
        await request.jwtVerify()
        reply.send({ code: 'OK', message: 'it works!' })
    } catch (error) {
        reply.send(error);
    }
})

fastify.decorate("authenticate", async (request, reply) => {
    try {
        await request.jwtVerify()
    } catch (err) {
        reply.send(err)
    }
})
.after(() => {
    fastify.route({
        method: "GET",
        url: '/secret',
        preHandler: [fastify.authenticate],
        handler: (req, reply) => {
            reply.send('secret')
        }
    })

})

fastify.post('/signup', (req, reply) => {
    const token = fastify.jwt.sign({ email: 'sumanshrestha670@gmail.com' })
    reply.send({ token })
})

fastify.listen(3000, '127.0.0.1', function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
})