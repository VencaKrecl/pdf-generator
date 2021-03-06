import express from 'express'
import path from 'path'
import { PdfGenerator } from '@vencakrecl/pdf-generator'

// PDF
const pdf = new PdfGenerator(path.join(path.join(__dirname, '/../data/demo-api')))
pdf.setLogger(console)
pdf.loadTemplates()

// HTTP server
const app = express()
app.use(express.json())

app.post('/generate/:key', async (req, res) => {
  try {
    const data = await pdf.generate(req.params.key, req.body)

    res.set('Content-Type', 'application/pdf')
    res.send(data)
  } catch (e) {
    console.error(e)
    res.status(400)
    res.send({ error: e.message, validErrors: e.errors })
  }
})

app.get('/templates-ids', async (req, res) => {
  const data = await pdf.getTemplateIds()

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(data))
})

const runApp = async (): Promise<void> => {
  await pdf.start()
  app.listen(3001, () => {
    console.log('HTTP server running on 3001')
  })
}

export default runApp
