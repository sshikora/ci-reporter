/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
// For more information on building apps:
// https://probot.github.io/docs/
// const { createRobot } = require('./robot')

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

const get = require('lodash.get')

module.exports = app => {
  app.log('Started SemaphoreCI Reporter tool')

  app.on('status', async context => {
    const eventContext = get(context, 'payload.context')
    if (eventContext.indexOf('semaphoreci') <= 0) { return }
    context.log('Found SemaphoreCI status event')
    const state = get(context, 'payload.state')
    if (state === 'pending') { return }
    const targetUrl = get(context, 'payload.target_url')

    const body =
       state === 'success'
         ? `Your build is green! Your good to go! [green build](${targetUrl})!`
         : `The Pull Request failed. The build is here [build](${targetUrl})`
    const { owner, repo } = context.repo()
    // const commit_id = get(context, 'payload.commit.sha')

    const branchName = get(context, 'payload.branches[0].name')

    const allPullRequests = await context.github.pullRequests.getAll({ owner, repo })

    const pullRequest = get(allPullRequests, 'data', [])
      .filter(pr => get(pr, 'head.ref') === branchName)[0]

    if (!pullRequest) return
    const { number } = pullRequest // Pull request and issue number are identical!

    await context.github.issues.createComment({ owner, repo, number, body })
  })
}
