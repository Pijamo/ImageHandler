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
const secret_provider_1 = require("../../secret-provider");
describe("getOutputFormat", () => {
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
    it('Should pass if it returns "webp" for an accepts header which includes webp', () => {
        // Arrange
        const event = {
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            },
        };
        process.env.AUTO_WEBP = "Yes";
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.getOutputFormat(event);
        // Assert
        expect(result).toEqual("webp");
    });
    it("Should pass if it returns null for an accepts header which does not include webp", () => {
        // Arrange
        const event = {
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            },
        };
        process.env.AUTO_WEBP = "Yes";
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.getOutputFormat(event);
        // Assert
        expect(result).toBeNull();
    });
    it("Should pass if it returns null when AUTO_WEBP is disabled with accepts header including webp", () => {
        // Arrange
        const event = {
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            },
        };
        process.env.AUTO_WEBP = "No";
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.getOutputFormat(event);
        // Assert
        expect(result).toBeNull();
    });
    it("Should pass if it returns null when AUTO_WEBP is not set with accepts header including webp", () => {
        // Arrange
        const event = {
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            },
        };
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.getOutputFormat(event);
        // Assert
        expect(result).toBeNull();
    });
});
//# sourceMappingURL=get-output-format.spec.js.map