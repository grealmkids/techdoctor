require('dotenv').config();
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
    region: process.env.B2_REGION || "us-east-005",
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY
    }
});

async function enableCors() {
    console.log('🔧 Configuring CORS for bucket:', process.env.BACKBLAZE_BUCKET_ID);

    const corsParams = {
        Bucket: process.env.BACKBLAZE_BUCKET_ID,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["GET", "HEAD"],
                    AllowedOrigins: ["*"], // Simplify to wildcard
                    ExposeHeaders: ["ETag"],
                    MaxAgeSeconds: 3000
                }
            ]
        }
    };

    try {
        const command = new PutBucketCorsCommand(corsParams);
        await s3.send(command);
        console.log('✅ CORS successfully enabled for bucket!');
    } catch (err) {
        console.error('❌ Failed to set CORS:', err);
    }
}

enableCors();
