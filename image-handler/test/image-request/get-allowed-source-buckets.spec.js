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
describe("getAllowedSourceBuckets", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    it("Should pass if the SOURCE_BUCKETS environment variable is not empty and contains valid inputs", () => {
        // Arrange
        process.env.SOURCE_BUCKETS = "allowedBucket001, allowedBucket002";
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.getAllowedSourceBuckets();
        // Assert
        const expectedResult = ["allowedBucket001", "allowedBucket002"];
        expect(result).toEqual(expectedResult);
    });
    it("Should throw an error if the SOURCE_BUCKETS environment variable is empty or does not contain valid values", () => {
        // Arrange
        process.env = {};
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            imageRequest.getAllowedSourceBuckets();
        }
        catch (error) {
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.BAD_REQUEST,
                code: "GetAllowedSourceBuckets::NoSourceBuckets",
                message: "The SOURCE_BUCKETS variable could not be read. Please check that it is not empty and contains at least one source bucket, or multiple buckets separated by commas. Spaces can be provided between commas and bucket names, these will be automatically parsed out when decoding.",
            });
        }
    });
});
//# sourceMappingURL=get-allowed-source-buckets.spec.js.map