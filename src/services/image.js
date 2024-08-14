const { Storage } = require('@google-cloud/storage');

const { BadRequestError } = require('../utils/error');

const storage = new Storage({
  keyFilename: process.env.GOOGLE_STORAGE_SECRET_PATH,
});

const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME);

const uploadMany = async (files = []) =>
  Promise.all(
    files.map(({ originalname, buffer }) => {
      const filename = `${Date.now()}-${originalname}`;
      const blob = bucket.file(filename);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      const url = new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(new BadRequestError(err.message));
        });
        blobStream.on('finish', async () => {
          resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        });
        blobStream.end(buffer);
      });
      return url;
    })
  );

module.exports = {
  uploadMany,
};
