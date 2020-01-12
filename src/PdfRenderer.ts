import express from 'express'
import * as http from 'http'
import Generator from '@src/Generator'
import Renderer from '@src/Renderer'
import Template from '@src/Template'
import path from 'path'

class PdfRenderer {
  private server: http.Server
  private readonly httpPort: number
  private readonly templatesPath: string
  public generator: Generator
  public renderer: Renderer

  constructor(templatesPath = __dirname, httpPort = 3000) {
    this.templatesPath = templatesPath
    this.httpPort = httpPort
    this.renderer = new Renderer()
    this.generator = new Generator()
  }

  public async start(): Promise<void> {
    const app = express()
    app.use('/static', express.static(this.templatesPath))

    this.server = app.listen(this.httpPort, () => {
      console.info(`Starting HTTP server on ${this.httpPort}`)
    })

    await this.generator.start()
  }

  public addTemplate(key: string, filename = 'template', schema: object = {}): void {
    this.renderer.addTemplate(new Template(key, path.join(this.templatesPath, filename), schema))
  }

  public renderPdf(key: string, data: object): Promise<Buffer> {
    return this.generator.generate(
      this.renderer.render(key, { baseUrl: `http://localhost:${this.httpPort}/static`, ...data })
    )
  }

  public async stop(): Promise<void> {
    await this.generator.stop()

    if (this.server) {
      this.server.close(() => {
        console.info('Closing HTTP server')
      })
    }
  }
}

export default PdfRenderer
