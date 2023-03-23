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
const imageRequestInfo = {
    bucket: "bucket",
    key: "key",
    requestType: lib_1.RequestTypes.THUMBOR,
    edits: { png: { quality: 80 } },
    originalImage: Buffer.from("image"),
    outputFormat: lib_1.ImageFormatTypes.JPEG,
};
describe("fixQuality", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    beforeEach(() => {
        jest.clearAllMocks();
        imageRequestInfo.edits = { png: { quality: 80 } };
    });
    it("Should map correct edits with quality key to edits if output in edits differs from output format in request ", () => {
        // Arrange
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Act
        imageRequest["fixQuality"](imageRequestInfo);
        // Assert
        expect(imageRequestInfo.edits).toEqual(expect.objectContaining({ jpeg: { quality: 80 } }));
        expect(imageRequestInfo.edits.png).toBe(undefined);
    });
    it("should not map edits with quality key if not output format is not a supported type", () => {
        // Arrange
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        imageRequestInfo.outputFormat = "pdf";
        // Act
        imageRequest["fixQuality"](imageRequestInfo);
        // Assert
        expect(imageRequestInfo.edits).toEqual(expect.objectContaining({ png: { quality: 80 } }));
    });
    it("should not map edits with quality key if not output format is the same as the quality key", () => {
        // Arrange
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        imageRequestInfo.outputFormat = lib_1.ImageFormatTypes.PNG;
        // Act
        imageRequest["fixQuality"](imageRequestInfo);
        // Assert
        expect(imageRequestInfo.edits).toEqual(expect.objectContaining({ png: { quality: 80 } }));
    });
    it("should not map edits with quality key if the request is of default type", () => {
        // Arrange
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        imageRequestInfo.outputFormat = lib_1.ImageFormatTypes.JPEG;
        imageRequestInfo.requestType = lib_1.RequestTypes.DEFAULT;
        // Act
        imageRequest["fixQuality"](imageRequestInfo);
        // Assert
        expect(imageRequestInfo.edits).toEqual(expect.objectContaining({ png: { quality: 80 } }));
    });
    it("should not map edits with quality key if the request is default type", () => {
        // Arrange
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        imageRequestInfo.outputFormat = lib_1.ImageFormatTypes.JPEG;
        imageRequestInfo.requestType = lib_1.RequestTypes.DEFAULT;
        // Act
        imageRequest["fixQuality"](imageRequestInfo);
        // Assert
        expect(imageRequestInfo.edits).toEqual(expect.objectContaining({ png: { quality: 80 } }));
    });
    it("should not map edits with quality key if the request if there is no output format", () => {
        // Arrange
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        delete imageRequestInfo.outputFormat;
        // Act
        imageRequest["fixQuality"](imageRequestInfo);
        // Assert
        expect(imageRequestInfo.edits).toEqual(expect.objectContaining({ png: { quality: 80 } }));
    });
});
//# sourceMappingURL=fix-quality.spec.js.map