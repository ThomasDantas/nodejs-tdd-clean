const { MongoClient } = require('mongodb')

module.exports = {
  async connect (uri, dbName) {
    this.ur = uri
    this.dbName = dbName

    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    this.db = this.client.db(dbName)
  },

  async disconect () {
    await this.client.close()
  },

  async getDb () {
    if (!this.client.isConnected()) {
      await this.connect(this.ur, this.dbName)
    }

    return this.db
  }
}
