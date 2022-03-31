// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const storage = new Storage();
const do_not_delete_buckets = ["list-of-buckets-to-keep"]

// Makes an authenticated API request.
async function listBuckets() {
  try {
    const results = await storage.getBuckets();
    
    const [buckets] = results;

    console.log('Buckets:');
    buckets.forEach(bucket => {
        if(bucket.name.startsWith('your-prefix')){
            console.log("Deleting bucket : ",bucket.name);
            deleteBucket(bucket.name)
        } else {
            console.log("Not marked for deletion:",bucket.name);
        }
    });
  } catch (err) {
    console.error('ERROR trying to delete bucket:', err);
  }
}

async function deleteBucket(bucketName) {
    const [files] = await storage.bucket(bucketName).getFiles();
    try {
        if(files.length != 0) {
            files.forEach(file => {
                console.log('file name', file.name)
                deleteFile(bucketName, file.name)
              });
        } 
        await storage.bucket(bucketName).delete();
        console.log('Bucket ${bucketName} deleted');
    } catch(err) {
        console.error('ERROR:', err);
    } 
   
  }

async function deleteFile(bucketName, fileName) {
    try {
        await storage.bucket(bucketName).file(fileName).delete();
        console.log(`gs://${bucketName}/${fileName} deleted`);
    } catch(err) {
        console.error('ERROR:', err);
    }

  }

async function listFilesAndDelete(bucketName) {
    // Lists files in the bucket
    const [files] = await storage.bucket(bucketName).getFiles();
  
    console.log('Files:');
    files.forEach(file => {
      console.log('file name', file.name)
      deleteFile(bucketName, file.name)
    });
  }

listBuckets().catch(console.error);

