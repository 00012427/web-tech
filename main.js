let express = require('express')
let fs = require('fs')
let app = express()
let bodyParser = require('body-parser')

let dbPath = require('./settings').dbPath

// parsing the data 
app.use(bodyParser.urlencoded({ extended: false }))

//this line is required to parse the request body
app.use(express.json())
app.use(express.static("public"))

// used engine ejs
app.set('view engine', 'ejs');

// retrive the data from db
function saveData(data) {
    let stringifyData = JSON.stringify(data)
    fs.writeFileSync('dbModules.json', stringifyData)
}

// gets the data from db
function getData() {
    let jsonFile = fs.readFileSync('dbModules.json')
    return JSON.parse(jsonFile)
}


// CRUD


// GET method
app.get('/', (req, res) => {
    let modules = getData();
    res.render('pages/index', {
        modules: modules,
    });
})

app.get('/module/list', function (req, res) {
    let modules = getData()
    res.send(modules);
});


app.get('/module/:id', function (req, res) {
    let modules = getData()
    let { id } = req.params


    let moduleFound = modules.find(m => m.id === Number(id))

    res.render('pages/edit', {
        id: id,
        module: moduleFound
    });
});



// POST method
app.post('/module/create/', (req, res) => {
  
    fs.readFile(dbPath('dbModules'), (err, data) => {
        if (err) res.render('modules', { success: false })

        let modules = JSON.parse(data)

        let { module, leader, description, rank } = req.body

        //push the new data

        modules.push({
            id: Date.now(),
            module: module,
            leader: leader,
            description: description,
            rank: rank
        })


        fs.writeFile(dbPath('dbModules'), JSON.stringify(modules), (err) => {
            if (err)
                res.render('modules', { success: false })
            else
                res.redirect('/')
        })
    })

})

// update method
app.post('/module/update/:id', (req, res) => {
    let { id } = req.params

    let modules = getData()

    // check whether module is exists     
    let isModule = modules.find(m => m.id === Number(id))
    if (!isModule)
        return res.status(409).send({ error: true, msg: 'module not found' })


    let editedModule = modules.filter(m => m.id !== Number(id))

    let { module, leader, description, rank } = req.body

    //push the updated data

    editedModule.push({
        id: Date.now(),
        module: module,
        leader: leader,
        description: description,
        rank: rank
    })



    // save updated data
    saveData(editedModule)

    // redirecting to index page
    res.redirect('/')

})

// Delete method
app.get('/module/delete/:id', (req, res) => {
    let { id } = req.params

    let modules = getData()

    let getModule = modules.filter(m => m.id !== Number(id));



    if (modules.length === getModule.length)
        return res.status(409).send({ error: true, msg: 'module not found' })


    // update the data
    saveData(getModule)

    // redirecting to index page
    res.redirect('/')

})

// port
app.listen(process.env.PORT || 5000, () => {
    console.log(`Running in port:  ${process.env.PORT}`)
})
