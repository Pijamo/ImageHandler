"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const secretsmanager_1 = __importDefault(require("aws-sdk/clients/secretsmanager"));
const image_request_1 = require("../../image-request");
const lib_1 = require("../../lib");
const secret_provider_1 = require("../../secret-provider");
const request = {
    bucket: "bucket",
    key: "key",
    edits: {
        roundCrop: true,
        resize: {
            width: 100,
            height: 100,
        },
    },
};
const createEvent = (request) => {
    return { path: `${Buffer.from(JSON.stringify(request)).toString("base64")}` };
};
describe("determineOutputFormat", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    it("Should map edits.toFormat to outputFormat in image request", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            edits: { toFormat: lib_1.ImageFormatTypes.PNG },
            originalImage: Buffer.from("image"),
        };
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.PNG);
    });
    it("Should map output format from edits to image request", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            originalImage: Buffer.from("image"),
        };
        request.outputFormat = lib_1.ImageFormatTypes.PNG;
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.PNG);
    });
    it("Should map reduction effort if included and output format is webp", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            originalImage: Buffer.from("image"),
        };
        request.outputFormat = lib_1.ImageFormatTypes.WEBP;
        request.effort = 3;
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.WEBP);
        expect(imageRequestInfo.effort).toEqual(3);
    });
    it("Should map default reduction effort if included but NaN and output format is webp", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            originalImage: Buffer.from("image"),
        };
        request.outputFormat = lib_1.ImageFormatTypes.WEBP;
        request.effort = "invalid";
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.WEBP);
        expect(imageRequestInfo.effort).toEqual(4);
    });
    it("Should map default reduction effort if included > 6 and output format is webp", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            originalImage: Buffer.from("image"),
        };
        request.outputFormat = lib_1.ImageFormatTypes.WEBP;
        request.effort = 7;
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.WEBP);
        expect(imageRequestInfo.effort).toEqual(4);
    });
    it("Should map default reduction effort if included but < 0 and output format is webp", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            originalImage: Buffer.from("image"),
        };
        request.outputFormat = lib_1.ImageFormatTypes.WEBP;
        request.effort = -1;
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.WEBP);
        expect(imageRequestInfo.effort).toEqual(4);
    });
    it("Should map truncated reduction effort if included but has a decimal and output format is webp", () => {
        // Arrange
        const imageRequestInfo = {
            bucket: "bucket",
            key: "key",
            requestType: lib_1.RequestTypes.DEFAULT,
            originalImage: Buffer.from("image"),
        };
        request.outputFormat = lib_1.ImageFormatTypes.WEBP;
        request.effort = 2.378;
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["determineOutputFormat"](imageRequestInfo, createEvent(request));
        // Assert
        expect(imageRequestInfo.outputFormat).toEqual(lib_1.ImageFormatTypes.WEBP);
        expect(imageRequestInfo.effort).toEqual(2);
    });
});
//# sourceMappingURL=determine-output-format.spec.js.map