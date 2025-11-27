const bcrypt = require('bcryptjs')

async function main() {
  const password = 'seo.root@example.com'
  const hash = '$2b$10$kynjkuGIIueD.4o02apuwe6munUMgXklCb09tEbuK6DGsSDnuB4Xu'
  
  const match = await bcrypt.compare(password, hash)
  console.log(`Password match: ${match}`)
}

main()
