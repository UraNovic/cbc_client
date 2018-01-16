# cbc Trade client

## Overview
The cbc Trade client is an open-source GUI for the cbc network that facilitates the peer-to-peer exchange of any store of value. It’s the only platform where you can trade between stores of value spanning fiat, cryptocurrencies, commodities, and unusual assets like pre-1965 silver dimes.

[cbc Labs](https://cbclabs.com) is the core team behind the project. For more information on the cbc protocol, please visit our [wiki](https://cbc.com/wiki/).

We would love to have folks contribute! Check out our bounties [here](https://www.bountysource.com/teams/cbc/bounties).

cbc Trade is available at www.cbctrade.com.


## Getting Started

### Install Dependencies

Install Node.js, Gulp, Git and Python 2 if you haven't already.

Install bower by running `sudo bower install --allow-root`.

Fork and clone the cbc-client repository and run `npm install`.

Create a new config.js file and copy/paste from config-example.js into the same directory.

### Build

Run 'gulp' in your command line for development.

Run 'gulp dist' for the production ready client.

Your web client is in the 'build/dist/' directory.

### Target backend

By default, the [cbc.txt](https://wiki.cbc.com/cbc.txt) file is pointed at the staging server.
__This means you will only be able to log in on your dev environment with an account created on [staging.cbctrade.com](https://staging.cbctrade.com).__

If you want to point your environment at the production server:
- set the authinfo_url in cbc.txt (in the root of the repo directory) to: `https://id.cbc.com/v1/authinfo` (make sure to rebuild + clear browser cache)
- set the `activate_link` property in config.js to `https://cbctrade.com/#/register/activate`

## Directory Layout

	build/         -->    compiled files
	deps/          -->    client dependencies
	docs/          -->    documentation
	src/           -->    source code
	src/js/client  -->    client classes
	src/js/entry   -->    entry points for the various client versions
	src/js/util    -->    various static, stateless utility functions
	tools/         -->    tools used in the build process


## Testing

Stay tuned...


## APIs and Libraries used by cbc Trade client

- [blobvault](https://github.com/cbc/cbc-blobvault)
- [cbc-lib](https://github.com/cbc/cbc-lib)
- [cbc-vault-client](https://github.com/cbc/cbc-vault-client)


## Reporting Bugs

Have a bug or a feature request? [Please create a new issue](https://cbclabs.atlassian.net/browse/RT). Before opening any issue, please search for [existing issues](https://cbclabs.atlassian.net/issues/?jql=project%20%3D%20RT) and read the [Issue Guidelines](https://github.com/cbc/cbc-client/blob/develop/CONTRIBUTING.md), written by [Nicolas Gallagher](https://github.com/necolas/).


## Contributing

cbc Labs uses [Jira](https://cbclabs.atlassian.net) to track issues. We highly encourage our community to contribute but please look at our [Development Policy](https://github.com/cbc/cbc-client/wiki/Development-Process-Policy) and our [CONTRIBUTING.md](https://github.com/cbc/cbc-client/blob/develop/CONTRIBUTING.md) file before submitting a pull request.

We are also using [Bountysource](https://www.bountysource.com/teams/cbc/bounties) allowing our community to request bids from developers to solve open-source issues!


## Community

Keep track of development and community news.

- Read and subscribe to the [The Official cbc Blog](https://cbc.com/blog/).
- Follow [@cbc on Twitter](https://twitter.com/cbc)
- Follow [@cbcLabs on Twitter](https://twitter.com/cbclabs)
- Like [cbc Labs on Facebook](https://facebook.com/cbclabs)
- Subscribe to [@cbc on Reddit](http://www.reddit.com/r/cbc)
- Subscribe to [the cbc user community on Reddit](http://www.reddit.com/r/cbcrs)
- Have a question that's not a feature request or bug report? Send a message to [support@cbc.com](mailto:support@cbc.com)
- Chat directly with our engineers! Join us [here](https://gitter.im/cbc/developers).


## More Information

https://cbc.com/wiki/cbc_Client


## License

[https://github.com/cbc/cbc-client/blob/develop/LICENSE](https://github.com/cbc/cbc-client/blob/develop/LICENSE)
