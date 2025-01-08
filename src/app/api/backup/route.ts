import redis from '@/lib/redis'
import { Dropbox } from 'dropbox'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

async function getRedisKeys(keyPattern: string, count = 1000) {
  let allKeys: string[] = []
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: keyPattern, count });
    cursor = parseInt(nextCursor, 10);
    allKeys = allKeys.concat(keys)
  } while (cursor !== 0);
  return allKeys
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      })
    }
  }

  try {
    // Initialize Dropbox Client
    const dbx = new Dropbox({
      fetch,
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    })

    let finance: { payments: string[], credits: object[] } = { payments: [], credits: [] }
    for (const key of await getRedisKeys("myai:payments:*")) {
      let payments = await redis.smembers(key)
      finance.payments = finance.payments.concat(payments)
    }
    for (const key of await getRedisKeys("myai:credits:*")) {
      let balance = await redis.get(key)
      finance.credits.push({
        uid: key.replace("myai:credits:", ""),
        balance: balance
      })
    }
    let replicate = []
    for (const key of await getRedisKeys("myai:replicate:*")) {
      let resp = await redis.json.get(key, "$")
      if (resp) {
        replicate.push(resp)
      }
    }

    // Format data for Dropbox
    const financeContent = JSON.stringify(finance, null, 2)
    const replicateContent = JSON.stringify(replicate, null, 2)

    const unixTimestamp = Math.floor(Date.now() / 1000)
    const financeFilePath = `/${unixTimestamp}/finance.json`
    const replicateFilePath = `/${unixTimestamp}/replicate.json`

    // Upload file to Dropbox
    await dbx.filesUpload({
      path: financeFilePath, // Dropbox path
      contents: financeContent,
      mode: { '.tag': 'overwrite' }, // Overwrite existing file with the same name
    })

    await dbx.filesUpload({
      path: replicateFilePath, // Dropbox path
      contents: replicateContent,
      mode: { '.tag': 'overwrite' }, // Overwrite existing file with the same name
    })


    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'MyAI <myai@tugan.app>',
      to: ['tugan0329@gmail.com'],
      subject: 'MyAI Backup Finished',
      html: `MyAI successfully backed up latest redis data to Dropbox at /${unixTimestamp}/*.json`,
    })

    return new Response(JSON.stringify({
      success: true, message: 'Backup uploaded successfully to dropbox'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}