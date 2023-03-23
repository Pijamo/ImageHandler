"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_1 = require("../mock");
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const secretsmanager_1 = __importDefault(require("aws-sdk/clients/secretsmanager"));
const image_request_1 = require("../../image-request");
const lib_1 = require("../../lib");
const secret_provider_1 = require("../../secret-provider");
describe("parseRequestType", () => {
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
    it("Should pass if the method detects a default request", () => {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJteS1zYW1wbGUtYnVja2V0Iiwia2V5IjoibXktc2FtcGxlLWtleSIsImVkaXRzIjp7ImdyYXlzY2FsZSI6dHJ1ZX19",
        };
        process.env = {};
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseRequestType(event);
        // Assert
        const expectedResult = lib_1.RequestTypes.DEFAULT;
        expect(result).toEqual(expectedResult);
    });
    it("Should pass if the method detects a thumbor request", () => {
        // Arrange
        const event = {
            path: "/unsafe/filters:brightness(10):contrast(30)/https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Coffee_berries_1.jpg/1200px-Coffee_berries_1.jpg",
        };
        process.env = {};
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseRequestType(event);
        // Assert
        expect(mock_1.consoleInfoSpy).toHaveBeenCalledWith("Path is not base64 encoded.");
        expect(result).toEqual(lib_1.RequestTypes.THUMBOR);
    });
    it("Should pass if get a request with supported image extension", () => {
        // Arrange
        const events = [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif", ".svg"].map((extension) => ({
            path: `image${extension}`,
        }));
        process.env = {};
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const results = events.map((event) => imageRequest.parseRequestType(event));
        // Assert
        expect(results).toEqual(new Array(events.length).fill(lib_1.RequestTypes.THUMBOR));
    });
    it("Should pass if the method detects a custom request", () => {
        // Arrange
        const event = { path: "/additionalImageRequestParameters/image.jpg" };
        process.env = {
            REWRITE_MATCH_PATTERN: "matchPattern",
            REWRITE_SUBSTITUTION: "substitutionString",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseRequestType(event);
        // Assert
        const expectedResult = lib_1.RequestTypes.CUSTOM;
        expect(result).toEqual(expectedResult);
    });
    it("Should throw an error if the method cannot determine the request type based on the three groups given", () => {
        // Arrange
        const event = { path: "12x12e24d234r2ewxsad123d34r.bmp" };
        process.env = {};
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            imageRequest.parseRequestType(event);
        }
        catch (error) {
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.BAD_REQUEST,
                code: "RequestTypeError",
                message: "The type of request you are making could not be processed. Please ensure that your original image is of a supported file type (jpg, png, tiff, webp, svg, gif) and that your image request is provided in the correct syntax. Refer to the documentation for additional guidance on forming image requests.",
            });
        }
    });
});
//# sourceMappingURL=parse-request-type.spec.js.map