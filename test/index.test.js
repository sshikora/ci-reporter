const nock = require('nock')
// Requiring our app implementation
const ciReporter = require('..')
const { Probot } = require('probot')
// Requiring our fixtures
const payload = require('./fixtures/pull_request.opened')
const payloadSuccess = require('./fixtures/pull_request.opened-success')
const compare = require('./fixtures/compare')
const compareSuccess = require('./fixtures/compare-success')
const checkRun = require('./fixtures/check_run.created')
const checkRunSuccess = require('./fixtures/check_run.created-success')

const issueCreatedBody = { body: 'Thanks for opening this issue!' }

nock.disableNetConnect()

describe('CI Reporter', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(ciReporter)

    // just return a test token
    app.app = () => 'test'
  })

  test('creates a comment when an issue is opened', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })

    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/hiimbex/testing-things/issues/1/comments', (body) => {
        expect(body).toMatchObject(issueCreatedBody)
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload })
  })

  test('creates a failing check', async () => {
    nock('https://api.github.com')
      .post('/app/installations/13055/access_tokens')
      .reply(200, { token: 'test' })

    nock('https://api.github.com')
      .get('/repos/robotland/test/contents/.github/ci-reporter.yml')
      .reply(404)

    nock('https://api.github.com')
      .get('/repos/robotland/test/compare/607c64cd8e37eb2db939f99a17bee5c7d1a90a31...e76ed6025cec8879c75454a6efd6081d46de4c94')
      .reply(200, compare)

    nock('https://api.github.com')
      .post('/repos/robotland/test/check-runs', (body) => {
        body.completed_at = '2018-07-14T18:18:54.156Z'
        expect(body).toMatchObject(checkRun)
        return true
      })
      .reply(200)

    await probot.receive({ name: 'pull_request', payload })
  })

  test('creates a passing check', async () => {
    nock('https://api.github.com')
      .post('/app/installations/13055/access_tokens')
      .reply(200, { token: 'test' })

    nock('https://api.github.com')
      .get('/repos/octocat/Hello-World/contents/.github/ci-reporter.yml')
      .reply(404)

    nock('https://api.github.com')
      .get('/repos/octocat/Hello-World/compare/a10867b14bb761a232cd80139fbd4c0d33264240...34c5c7793cb3b279e22454cb6750c80560547b3a')
      .reply(200, compareSuccess)

    nock('https://api.github.com')
      .post('/repos/octocat/Hello-World/check-runs', (body) => {
        body.completed_at = '2018-07-14T18:18:54.156Z'
        expect(body).toMatchObject(checkRunSuccess)
        return true
      })
      .reply(200)

    await probot.receive({ name: 'pull_request', payload: payloadSuccess })
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
