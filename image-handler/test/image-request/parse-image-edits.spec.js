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
describe("parseImageEdits", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    const OLD_ENV = process.env;
    beforeEach(() => {
        process.env = Object.assign({}, OLD_ENV);
    });
    afterAll(() => {
        process.env = OLD_ENV;
    });
    it("Should pass if the proper result is returned for a sample base64-encoded image request", () => {
        // Arrange
        const event = {
            path: "/eyJlZGl0cyI6eyJncmF5c2NhbGUiOiJ0cnVlIiwicm90YXRlIjo5MCwiZmxpcCI6InRydWUifX0=",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseImageEdits(event, lib_1.RequestTypes.DEFAULT);
        // Assert
        const expectedResult = { grayscale: "true", rotate: 90, flip: "true" };
        expect(result).toEqual(expectedResult);
    });
    it("Should pass if the proper result is returned for a sample thumbor-type image request", () => {
        // Arrange
        const event = {
            path: "/filters:rotate(90)/filters:grayscale()/thumbor-image.jpg",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseImageEdits(event, lib_1.RequestTypes.THUMBOR);
        // Assert
        const expectedResult = { rotate: 90, grayscale: true };
        expect(result).toEqual(expectedResult);
    });
    it("Should pass if the proper result is returned for a sample custom-type image request", () => {
        // Arrange
        const event = {
            path: "/filters-rotate(90)/filters-grayscale()/thumbor-image.jpg",
        };
        process.env = {
            REWRITE_MATCH_PATTERN: "/(filters-)/gm",
            REWRITE_SUBSTITUTION: "filters:",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseImageEdits(event, lib_1.RequestTypes.CUSTOM);
        // Assert
        const expectedResult = { rotate: 90, grayscale: true };
        expect(result).toEqual(expectedResult);
    });
    it("Should throw an error if a requestType is not specified and/or the image edits cannot be parsed", () => {
        // Arrange
        const event = {
            path: "/filters:rotate(90)/filters:grayscale()/other-image.jpg",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            imageRequest.parseImageEdits(event, undefined);
        }
        catch (error) {
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.BAD_REQUEST,
                code: "ImageEdits::CannotParseEdits",
                message: "The edits you provided could not be parsed. Please check the syntax of your request and refer to the documentation for additional guidance.",
            });
        }
    });
});
//# sourceMappingURL=parse-image-edits.spec.js.map