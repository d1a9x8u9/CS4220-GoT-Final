// App components
const resultsComponent = {
    template: `<div>
                <h3>Results</h3>
                <ul v-for="result in results">
                    <li v-for="r in result">
                        <span @click="$root.getDetailedResultClickHandler(r)">{{r.name}}</span>
                    </li>
                </ul>
            </div>`,
    props: ['results']
}

const moreDetailsComponent = {
    template: `<div>
                <h3><span @click="$root.listResults" style="color: blue; cursor: pointer">Results </span>\> {{result.name}}</h3>
                <ul v-for="key in result">
                    <span>{{key}}</span>
                </ul>
            </div>`,
    props: ['result']
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
        searched: [],
        message: '',
        results: [],
        result: [],
        detailedResult: false,
    },
    methods: {
        searchHandler: function () {
            if (!this.search) return

            socket.emit('entered-search', this.search)
        },
        searchHistoryClickHandler: function (prevSearchedKeyword) {
            socket.emit('clicked-history', prevSearchedKeyword)
        },
        getDetailedResultClickHandler: function (ob) {
            this.detailedResult = true
            this.result = ob
            // this.message = `Displaying cached detailed result for "${ob.name}"`
            this.message = ''
        },
        listResults: function () {
            this.detailedResult = false
        }
    },
    components: {
        'results-component': resultsComponent,
        'history-component': historyComponent,
        'moredetails-component': moreDetailsComponent,
    }
})

// Client Side Socket Event
socket.on('refresh-history', searched => {
    app.searched = searched
})

socket.on('successful-search', search => {
    app.detailedResult = false
    app.message = ''
    app.results = []
    app.results.push(search.results)

    app.searched.push(search)
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
    app.message = `Displaying cached results for "${keywords}".`
    app.detailedResult = false
})

socket.on('err-api', err => {
    app.message = `[Api] ${err}`
})