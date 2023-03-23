"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
describe("getOriginalImage", () => {
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    const secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    beforeEach(() => {
        jest.resetAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("Should pass if the proper bucket name and key are supplied, simulating an image file that can be retrieved", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const result = yield imageRequest.getOriginalImage("validBucket", "validKey");
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "validBucket",
            Key: "validKey",
        });
        expect(result.originalImage).toEqual(Buffer.from("SampleImageContent\n"));
    }));
    it("Should throw an error if an invalid bucket or key name is provided, simulating a non-existent original image", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.reject(new lib_1.ImageHandlerError(lib_1.StatusCodes.NOT_FOUND, "NoSuchKey", "SimulatedException"));
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            yield imageRequest.getOriginalImage("invalidBucket", "invalidKey");
        }
        catch (error) {
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "invalidBucket",
                Key: "invalidKey",
            });
            expect(error.status).toEqual(lib_1.StatusCodes.NOT_FOUND);
        }
    }));
    it("Should throw an error if an unknown problem happens when getting an object", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.reject(new lib_1.ImageHandlerError(lib_1.StatusCodes.INTERNAL_SERVER_ERROR, "InternalServerError", "SimulatedException"));
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            yield imageRequest.getOriginalImage("invalidBucket", "invalidKey");
        }
        catch (error) {
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "invalidBucket",
                Key: "invalidKey",
            });
            expect(error.status).toEqual(lib_1.StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }));
    ["binary/octet-stream", "application/octet-stream"].forEach((contentType) => {
        test.each([
            { hex: [0x89, 0x50, 0x4e, 0x47], expected: "image/png" },
            { hex: [0xff, 0xd8, 0xff, 0xdb], expected: "image/jpeg" },
            { hex: [0xff, 0xd8, 0xff, 0xe0], expected: "image/jpeg" },
            { hex: [0xff, 0xd8, 0xff, 0xee], expected: "image/jpeg" },
            { hex: [0xff, 0xd8, 0xff, 0xe1], expected: "image/jpeg" },
            { hex: [0x52, 0x49, 0x46, 0x46], expected: "image/webp" },
            { hex: [0x49, 0x49, 0x2a, 0x00], expected: "image/tiff" },
            { hex: [0x4d, 0x4d, 0x00, 0x2a], expected: "image/tiff" },
            { hex: [0x47, 0x49, 0x46, 0x38], expected: "image/gif" },
        ])("Should pass and infer $expected content type if there is no extension", ({ hex, expected }) => __awaiter(void 0, void 0, void 0, function* () {
            // Mock
            mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({
                        ContentType: contentType,
                        Body: Buffer.from(new Uint8Array(hex)),
                    });
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            const result = yield imageRequest.getOriginalImage("validBucket", "validKey");
            // Assert
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "validBucket",
                Key: "validKey",
            });
            expect(result.originalImage).toEqual(Buffer.from(new Uint8Array(hex)));
            expect(result.contentType).toEqual(expected);
        }));
    });
});
//# sourceMappingURL=get-original-image.spec.js.map