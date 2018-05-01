const
    superagent = require('superagent'),
    config = require('./config')

const _fetch = (command) => {
    return superagent.get(`${config.url}/${command}`)
        .then(response => response.body)
        .catch(error => error.response.body)
}

exports.character = (name) => {
    return _fetch(`houses/?region=${name}`)
}
