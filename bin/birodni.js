#!/usr/bin/env node

/* eslint-disable require-jsdoc, no-console, max-statements */

"use strict";

const util = require("util");
const fs = require("fs");
const fsPromises = fs.promises;
const cloudinary = require("cloudinary").v2;
const download = require("image-downloader");

const config = require("./birodni-config.js");

const dniItems = [];
const fileItems = [];

async function downloadIMG(url, dest) {
    try {
        const { filename, image } = await download.image({ url: url, dest: dest });
        console.log(`${url}\n===> ${filename}\n`);
    } catch (error) {
        throw error;
    }
}

async function parseFSItems() {
    const fsItems = await fsPromises.readdir(".");

    await Promise.all(fsItems.map(async fsItem => {
        const isDirectory = (await fsPromises.stat(fsItem)).isDirectory();
        (isDirectory ? dniItems : fileItems).push(fsItem);
    }));
}

const cloudinaryUpload = util.promisify(cloudinary.uploader.upload);

function getLocalFileName(dniItem, fileItem) {
    return `${dniItem}\\${fileItem.replace(".", `-${dniItem}.`)}`;
}

async function parseImage(imagePath) {

    console.log(`parseImage ${imagePath}`);

    const result = await cloudinaryUpload(imagePath);
    // console.log(result);

    for (const dniItem of dniItems) {
        const [width, height] = dniItem.split("x");
        console.log(`width: ${width} height: ${height}`);

        const url = cloudinary.url(result.public_id, { width: width, height: height, quality: "auto" });
        console.log(`url: ${url}`);
        // const localPath = `${dniItem}\\${imagePath}`;
        // console.log(`localPath: ${localPath}`);
        await downloadIMG(url, getLocalFileName(dniItem, imagePath));

    }
}

async function main() {
    cloudinary.config(config);

    await parseFSItems();
    console.log(`dni: ${dniItems}`);
    console.log(`files: ${fileItems}`);

    // fileItems.forEach(async fileItem => {
    //     await parseImage(fileItem);
    // });

    for (const fileItem of fileItems) {
        await parseImage(fileItem);
    }
}

console.log("birodni says Hello 7");
main();
