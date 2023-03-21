//require express and store in variable so we can use express
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
//port for using our local host
const PORT = 8000
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'Daily-Planner-List'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/',async (request, response)=>{
    const todoItems = await db.collection('Daily-Planner-List').find().toArray()
    const itemsLeft = await db.collection('Daily-Planner-List').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {
    db.collection('Daily-Planner-List').insertOne({thing: request.body.todoItem, time: request.body.todoTime ,completed: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('Daily-Planner-List').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('Daily-Planner-List').deleteOne({thing: request.body.todoItem})
    .then(result => {
        console.log('Item Deleted')
        response.json('Item Deleted')
    })
    .catch(error => console.error(error))

})

//listening for the live server on local host
app.listen(process.env.PORT || PORT, ()=>{
    console.log('Server is running.')
})