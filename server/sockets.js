module.exports = (server) => {
    const
        io = require('socket.io')(server),
        moment = require('moment'),
        gotApi = require('./index.js')

    const searched = []

    // When page is loaded, event is fired
    io.on('connection', socket => {

        // load search history
        socket.emit('refresh-history', searched)

        socket.on('clicked-history', input => {
            const result = searched.filter(search => search.keyword.toUpperCase() === input.toUpperCase())

            io.emit('retrieved-prev-result', result)
        })

        socket.on('entered-search', input => {
            // Filter thorugh our searched history return any object that matches
            const prevSearched = searched.filter(search => search.keyword.toUpperCase() === input.toUpperCase())

            // If none, then create new and emit success, else emit previously searched
            if (!prevSearched.length) {
                gotApi.character(input)
                    .then(res => {

                        const search = {
                            id: socket.id,
                            keyword: input,
                            results: res.length > 0 ? res : null
                        }

                        searched.push(search)
                        io.emit('successful-search', search)

                    })
                    .catch(err => io.emit('error-api', err))
            } else {
                io.emit('retrieved-prev-result', prevSearched)
            }
        })
    })
}