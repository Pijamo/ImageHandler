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
describe("inferImageType", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    it('Should pass if it returns "image/jpeg"', () => {
        // Arrange
        const imageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xee, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = imageRequest.inferImageType(imageBuffer);
        // Assert
        expect(result).toEqual("image/jpeg");
    });
    it("Should pass throw an exception", () => {
        // Arrange
        const imageBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        try {
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            imageRequest.inferImageType(imageBuffer);
        }
        catch (error) {
            // Assert
            expect(error.status).toEqual(500);
            expect(error.code).toEqual("RequestTypeError");
            expect(error.message).toEqual("The file does not have an extension and the file type could not be inferred. Please ensure that your original image is of a supported file type (jpg, png, tiff, webp, svg). Refer to the documentation for additional guidance on forming image requests.");
        }
    });
});
//# sourceMappingURL=infer-image-type.spec.js.map