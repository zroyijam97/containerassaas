import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const endpoint = process.env.MINIO_ENDPOINT || ''
const region = process.env.MINIO_REGION || 'us-east-1'
const accessKeyId = process.env.MINIO_ACCESS_KEY || ''
const secretAccessKey = process.env.MINIO_SECRET_KEY || ''
const bucket = process.env.MINIO_BUCKET || ''
const forcePathStyle = (process.env.MINIO_FORCE_PATH_STYLE || 'true') === 'true'

const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle,
  credentials: { accessKeyId, secretAccessKey }
})

export async function POST(req: Request) {
  const body = await req.json()
  const key = String(body.key || '')
  const contentType = String(body.contentType || 'application/octet-stream')

  if (!key || !bucket) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const putCmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const uploadUrl = await getSignedUrl(s3, putCmd, { expiresIn: 900 })

  const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key })
  const downloadUrl = await getSignedUrl(s3, getCmd, { expiresIn: 900 })

  return NextResponse.json({ key, uploadUrl, downloadUrl })
}
