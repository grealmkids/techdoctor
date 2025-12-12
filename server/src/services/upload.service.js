const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');

// Configure S3 Client for Backblaze B2
const s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT || "https://s3.us-east-005.backblazeb2.com",
    region: process.env.B2_REGION || "us-east-005",
    credentials: {
        accessKeyId: process.env.B2_ACCESS_KEY_ID,
        secretAccessKey: process.env.B2_SECRET_ACCESS_KEY
    }
});

// Multer Memory Storage (We upload directly to S3 from buffer)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});

const uploadToS3 = async (file, folder) => {
    if (!file) return null;

    const key = `${folder}/${Date.now()}-${file.originalname}`;

    // STRICT MODE: No mocks allowed. Fails if keys are missing.
    if (!process.env.B2_ACCESS_KEY_ID || !process.env.B2_SECRET_ACCESS_KEY) {
        const error = new Error('❌ Backblaze B2 credentials missing in server environment.');
        console.error(error.message);
        throw error;
    }

    try {
        const parallelUploads3 = new Upload({
            client: s3,
            params: {
                Bucket: process.env.BACKBLAZE_BUCKET_ID,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            },
        });

        const result = await parallelUploads3.done();
        return result.Location || `https://${process.env.BACKBLAZE_BUCKET_ID}.s3.${process.env.B2_REGION}.backblazeb2.com/${key}`;
    } catch (error) {
        console.error('❌ S3 Upload Error:', error);
        throw new Error(`Failed to upload file to Backblaze: ${error.message}`);
    }
};

module.exports = { upload, uploadToS3 };
