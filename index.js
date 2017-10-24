const express = require('express'),
      app = express(),
      MONGO = process.env.MONGO || 'mongodb://mongodb:27017/todo',
      {MongoClient, ObjectID} = require('mongodb'),
      LISTEN_ADDRESS = process.env.LISTEN_ADDRESS || '0.0.0.0',
      LISTEN_PORT = process.env.LISTEN_PORT || 8080

const head = `
<html>
<head>
  <title>ToDo List</title>
</head>
</body>
  <h1>ToDo List</h1>
  <span>New Item: </span><input type="text" style="width: 450px" id="new-item" autofocus onkeydown="if (event.keyCode ===13) { handleAdd(); }"><button onclick="handleAdd()">Add</button><button onclick="handleClear()">Clear</button>
  <table style="margin-top: 10px">
`

const tail = `
  </table>
  <script>
    ${handleAdd.toString()}
    ${handleClear.toString()}
    ${handleChange.toString()}
    ${handleDelete.toString()}
  </script>
</body>
</html>
`

// client side code
function handleAdd() {
  const text = document.getElementById('new-item').value
  if (text.length) {
    window.location.href=`/add?text=${encodeURI(text)}`
  }
}
function handleChange(input, id) {
  window.location.href=`/change?id=${encodeURI(id)}&value=${input.checked}`
}
function handleDelete(id) {
  window.location.href=`/delete?id=${encodeURI(id)}`
}
function handleClear() {
  window.location.href='/clear'
}

async function main() {
  try {
    const db = await MongoClient.connect(MONGO),
          collection = db.collection('items')

    console.log('\n===> connected to mongodb')

    function itemText(record) {
      if (record.done) {
        return `<span style="text-decoration: line-through">${record.text}</span>`
      }
      else {
        return record.text
      }
    }

    app.get('/', async (req, res) => {
      let html = head
      const records = await collection.find({}).toArray()
      for (const record of Object.values(records)) {
        html += `
    <tr>
      <td style="width: 500px">${itemText(record)}</td>
      <td><input type="checkbox" ${record.done ? 'checked' : ''} onchange="handleChange(this, '${record._id}')"/></td>
      <td><button onclick="handleDelete('${record._id}')">Delete</button>
    </tr>`
      }
      res.send(html + tail)
    })

    app.get('/add', async (req, res) => {
      const text = req.query.text
      await collection.insert({
        text: text,
        done: false
      })
      res.redirect('/')
    })

    app.get('/change', async (req, res) => {
      const id = ObjectID(req.query.id),
            update = {$set: { done: req.query.value === 'true'}}

      await collection.update({ _id: id }, update)
      res.redirect('/')
      
    })

    app.get('/delete', async (req, res) => {
      const id = ObjectID(req.query.id)

      await collection.remove({ _id: id })
      res.redirect('/')
      
    })
    app.get('/clear', async(req, res) => {
      await collection.remove({})
      res.redirect('/')
    })
    app.listen(LISTEN_PORT, LISTEN_ADDRESS , () => {
      console.log(`Example listening on address ${LISTEN_ADDRESS}, port ${LISTEN_PORT}`)
    }) 
  }
  catch (e) {
    console.log('exception', e)
  }
}

main()

