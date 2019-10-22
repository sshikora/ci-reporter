# ci-reporter

> A GitHub App built with [Probot](https://github.com/probot/probot) that report ci errors in pr&#x27;s

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## The project

First challenge was to get webhooks running with local code. At first I thought a separate server would be needed, so I spent time setting that up with a separate server that would emit the hooks, before I realized that you could use a service to do the same thing.

Building a Probot app was very confusing as it wasn't clear from the documentation how to connect the local app to the webhook events. Finding all the events, their fields, what triggered them and why was also not straight forward.

I started with CircleCI but wasn't able get CircleCI to emit correct events, so I switched to SemaphoreCI which did. I worked for a long time, and have a few other more interesting versions of this app, that worked to pull the branch and build info from the event context, pull PR and success/error data from SemaphoreCI, and pull that all to build better comment text, but ran out of time when the SemaphoreCI API didn't cooperate to give me the data I needed.


## License

[ISC](LICENSE) © 2019 Seth Shikora <seth@shikora.org> (shikora.org)
