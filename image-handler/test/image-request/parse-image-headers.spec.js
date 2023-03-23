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
describe("parseImageHeaders", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    it("001/Should return headers if headers are provided for a sample base64-encoded image request", () => {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiaGVhZGVycyI6eyJDYWNoZS1Db250cm9sIjoibWF4LWFnZT0zMTUzNjAwMCxwdWJsaWMifSwib3V0cHV0Rm9ybWF0IjoianBlZyJ9",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseImageHeaders(event, lib_1.RequestTypes.DEFAULT);
        // Assert
        const expectedResult = {
            "Cache-Control": "max-age=31536000,public",
        };
        expect(result).toEqual(expectedResult);
    });
    it("001/Should return undefined if headers are not provided for a base64-encoded image request", () => {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5In0=",
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseImageHeaders(event, lib_1.RequestTypes.DEFAULT);
        // Assert
        expect(result).toEqual(undefined);
    });
    it("001/Should return undefined for Thumbor or Custom requests", () => {
        // Arrange
        const event = { path: "/test.jpg" };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.parseImageHeaders(event, lib_1.RequestTypes.THUMBOR);
        // Assert
        expect(result).toEqual(undefined);
    });
});
//# sourceMappingURL=parse-image-headers.spec.js.map