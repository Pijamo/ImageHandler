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
describe("decodeRequest", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    it("Should pass if a valid base64-encoded path has been specified", () => {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJidWNrZXQtbmFtZS1oZXJlIiwia2V5Ijoia2V5LW5hbWUtaGVyZSJ9",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.decodeRequest(event);
        // Assert
        const expectedResult = {
            bucket: "bucket-name-here",
            key: "key-name-here",
        };
        expect(result).toEqual(expectedResult);
    });
    it("Should throw an error if a valid base64-encoded path has not been specified", () => {
        // Arrange
        const event = { path: "/someNonBase64EncodedContentHere" };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            imageRequest.decodeRequest(event);
        }
        catch (error) {
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.BAD_REQUEST,
                code: "DecodeRequest::CannotDecodeRequest",
                message: "The image request you provided could not be decoded. Please check that your request is base64 encoded properly and refer to the documentation for additional guidance.",
            });
        }
    });
    it("Should throw an error if no path is specified at all", () => {
        // Arrange
        const event = {};
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            imageRequest.decodeRequest(event);
        }
        catch (error) {
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.BAD_REQUEST,
                code: "DecodeRequest::CannotReadPath",
                message: "The URL path you provided could not be read. Please ensure that it is properly formed according to the solution documentation.",
            });
        }
    });
});
//# sourceMappingURL=decode-request.spec.js.map