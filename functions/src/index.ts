import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as cors from 'cors'

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://encuestafirestore.firebaseio.com'
});

const db = admin.firestore()
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({
      mensaje: 'Hello desde firebase!'});
});

export const getGOTY = functions.https.onRequest( async (request, response) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get()
  const misJuegos = docsSnap.docs.map(doc=> doc.data())  
  response.json(misJuegos)
});

// EXPRESS
const app = express();

const port = process.env.PORT || 5000

app.use(cors ({ origin: true }))
app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get()
  const misJuegos = docsSnap.docs.map(doc=> doc.data())  
  res.json(misJuegos)
})

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id)
  const gameSnap = await gameRef.get()

  if(!gameSnap.exists){
      res.status(404).json({
        ok: false,
        mensaje: 'No existe un juego con ese id ' + id
      })
  }else{
    const antes = gameSnap.data() || {votos : 0}
     await gameRef.update({
        votos: antes.votos +1
      })

    res.json({
      ok: true,
      mensaje: `Gracias por votar por ${antes.name}`
    })
  }
})

app.listen(port, ()=> {
  console.log(`Estamos en el puerto ${port}`)
})

export const api = functions.https.onRequest( app )