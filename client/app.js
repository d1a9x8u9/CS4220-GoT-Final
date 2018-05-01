// App components
const resultsComponent = {
    template: `<div>
                <h3>Results</h3>
                <ul v-for="result in results">
                    <li>
                        <span>{{result}}</span>
                    </li>
                </ul>
            </div>`,
    props: ['results']
}

const historyComponent = {
    template: `<div>
                <h3>Previous Search History</h3>
                <ul v-for="s in searched">
                    <li>
                        <span @click="$root.searchHistoryClickHandler(s.keyword)">{{s.keyword}}</span>
                    </li> 
                </ul>
            </div>`,
    props: ['searched']
}

const socket = io()
const app = new Vue({
    el: '#got-app',
    data: {
        search: '',
        clickedIndex: '',
        searched: [],
        message: '',
        results: [],
    },
    methods: {
        searchHandler: function () {
            if (!this.search) return

            socket.emit('entered-search', this.search)
        },
        searchHistoryClickHandler: function (prevSearchedKeyword) {
            socket.emit('clicked-history', prevSearchedKeyword)
        }
    },
    components: {
        'results-component': resultsComponent,
        'history-component': historyComponent
    }
})

// Client Side Socket Event
socket.on('refresh-history', searched => {
    app.searched = searched
})

socket.on('successful-search', search => {
    app.results = []
    app.results.push(search.results)

    app.searched.push(search)
})

socket.on('prev-search', search => {
    app.message = `"${search}" found in search history. Displaying cached results...`
})

socket.on('retrieved-prev-result', retrievedResult => {
    let keywords = []
    app.results = []

    retrievedResult.forEach(res => {
        app.results.push(res.results)

        if (!keywords.includes(res.keyword))
            keywords.push(res.keyword)
    })

    keywords = keywords.join('')
    app.message = `Displaying cached results for ${keywords}.`
})

socket.on('err-api', err => {
    app.message = `[Api] ${err}`
})