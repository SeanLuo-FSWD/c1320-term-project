/*
 * Project: COMP1320 Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date:
 * Author:
 *
 */

const unzipper = require("unzipper"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path");

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    let stream = fs
      .createReadStream(pathIn)
      .pipe(unzipper.Extract({ path: pathOut }));

    stream.on("error", (err) => {
      reject(err);
    });
    stream.on("finish", () => {
      console.log("Extraction operation complete");
      resolve();
    });
  });
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */

const readDir = (dir) => {
  const macRm = path.join(dir, "__MACOSX");
  return new Promise((resolve, reject) => {
    fs.rmdir(macRm, { recursive: true }, () => {
      fs.readdir(dir, (err, files) => {
        if (err) {
          reject(err);
        } else {
          console.log(files);
          resolve(files);
        }
      });
    });
  });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < pathIn.length; i++) {
      let imgPath = path.join(__dirname, "unzipped", pathIn[i]);
      //create a read stream from an img
      fs.createReadStream(imgPath)
        .pipe(
          //sending the read bytes to the PNG library, which is a function that give us back the transform stream
          new PNG({
            filterType: 4,
          })
        )
        // parse the binary data to pixel data that we use
        .on("parsed", function () {
          console.log("parsed");
          for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
              let idx = (this.width * y + x) << 2;
              let grey =
                this.data[idx] * 0.299 +
                this.data[idx + 1] * 0.587 +
                this.data[idx + 2] * 0.114;

              this.data[idx] = grey;
              this.data[idx + 1] = grey;
              this.data[idx + 2] = grey;
            }
          }

          let greyImg = this.pack().pipe(
            fs.createWriteStream(path.join(pathOut, pathIn[i]))
          );
          greyImg.on("error", (err) => {
            reject(err);
          });
          greyImg.on("finish", () => {
            console.log("Greyscale images saved");
            resolve();
          });
        });
    }
  });
};

module.exports = {
  unzip,
  readDir,
  grayScale,
};
