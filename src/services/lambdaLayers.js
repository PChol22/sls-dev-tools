const fs = require("fs");

function addLayerToLambda(lambdaApi, functionName, layerArn, resolve, reject) {
  const params = {
    FunctionName: functionName,
    Layers: [layerArn],
    Runtime: "provided",
  };
  lambdaApi.updateFunctionConfiguration(params, (err) => {
    if (err) {
      console.error(err);
      reject();
    }
    console.log("Relay layer added");
    resolve();
  });
}

function createAndAddLambdaLayer(lambdaApi, functionName, resolve, reject) {
  console.log("Uploading Lamba Layer...");
  let data;
  try {
    data = fs.readFileSync("resources/layer.zip");
  } catch (err) {
    console.error(err);
    reject();
  }

  const params = {
    Content: {
      ZipFile: data,
    },
    LayerName: "test-node10-layer",
  };

  lambdaApi.publishLayerVersion(params, (err, layer) => {
    if (err) {
      console.error(err);
      reject();
    } else {
      console.log("Layer uploaded. Adding to function...");
      const arn = layer.LayerVersionArn;
      addLayerToLambda(lambdaApi, functionName, arn, resolve, reject);
    }
  });
}

function setupLambdaLayer(lambdaApi, functionConfig) {
  // TODO: Determine required layer name using function runtime
  const requiredLayerName = "test-node10-layer";
  console.log("Searching for existing layer");
  return new Promise((resolve, reject) => {
    lambdaApi.listLayers({}, (err, data) => {
      if (err) {
        console.error(err);
        reject();
      } else {
        let layerFound = false;
        data.Layers.forEach((layer) => {
          if (layer.LayerName === requiredLayerName) {
            layerFound = true;
            console.log("Existing layer found. Adding to function...");
            addLayerToLambda(
              lambdaApi,
              functionConfig.FunctionName,
              layer.LatestMatchingVersion.LayerVersionArn,
              resolve,
              reject
            );
          }
        });
        if (!layerFound) {
          console.log("No existing layer found");
          createAndAddLambdaLayer(
            lambdaApi,
            functionConfig.FunctionName,
            resolve,
            reject
          );
        }
      }
    });
  });
}

function removeLambdaLayer(lambdaApi, lambdaName) {
  const params = {
    FunctionName: lambdaName,
    Runtime: "nodejs10.x",
  };
  lambdaApi.updateFunctionConfiguration(params, (err, data) => {
    if (err) {
      console.error(err);
    }
    console.log(data);
  });
}

module.exports = {
  removeLambdaLayer,
  setupLambdaLayer,
};
