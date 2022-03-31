const LC = require('logger-colors')
let log = new LC.Logger({
  operationId: 'CloudStorageCleaner',
})
// Imports the Google Cloud client library
const { Storage } = require('@google-cloud/storage');

// Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
const sleep = ms => new Promise(res => setTimeout(res, ms));


class CloudStorageCleaner {
  static async getBuckets(env) {
    log.info('Getting buckets for env ' + env)
    let project = '';
    if (env == 'dev') {
      project = 'accu-app-dev';
    } else if (env == 'qa') {
      project = 'accu-app-qa-0bb8';
    }
    // Makes an authenticated API request.
    const storage = new Storage({
      projectId: project,
    });

    const [buckets] = await storage.getBuckets();
    log.info(`buckets: ${buckets.map(b => b.name)}`)

    return buckets;

  }


  static async clean(env) {
    log.info('Cleaning buckets for env ' + env)

    try {
      const buckets = await this.getBuckets(env);
      //console.log('Buckets:');
      for (let i = 0; i <= buckets.length; i++) {
        let bucket = buckets[i];
        if (bucket.name.startsWith('accu-app-dev-project_')
          || bucket.name.startsWith('accu-app-qa-0bb8-project_')
          || bucket.name.startsWith('null-project_orbis')
        ) {
          log.magenta("Deleting bucket : " + bucket.name);
          log.info(`process.env.ENABLED : ${process.env.ENABLED}`);
          if (process.env.ENABLED == "true") {
            await deleteBucket(bucket.name)
          }
        } else {
          log.info("Not marked for deletion: " + bucket.name);
        }
      }
    } catch (err) {
      log.error(err)
    }
  }


}



async function deleteBucket(bucketName) {
  const [files] = await storage.bucket(bucketName).getFiles();
  try {
    if (files.length != 0) {
      for (let i = 0; i <= files.length; i++) {
        await deleteFile(bucketName, files[i].name)
      }
    }
    //await sleep(500);
    await storage.bucket(bucketName).delete();
    log.success(`Bucket ${bucketName} deleted`);
  } catch (err) {
    log.error(err)

  }

}

async function deleteFile(bucketName, fileName) {
  try {
    await storage.bucket(bucketName).file(fileName).delete();
    log.success(`gs://${bucketName}/${fileName} deleted`);
  } catch (err) {
    log.error(err)

  }

}


module.exports = CloudStorageCleaner;
