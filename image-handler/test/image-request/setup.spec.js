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
describe("setup", () => {
    const OLD_ENV = process.env;
    const s3Client = new s3_1.default();
    const secretsManager = new secretsmanager_1.default();
    let secretProvider = new secret_provider_1.SecretProvider(secretsManager);
    beforeEach(() => {
        jest.resetAllMocks();
        process.env = Object.assign({}, OLD_ENV);
    });
    afterEach(() => {
        jest.clearAllMocks();
        secretProvider = new secret_provider_1.SecretProvider(secretsManager); // need to re-create the provider to make sure the secret is not cached
        process.env = OLD_ENV;
    });
    it("Should pass when a default image request is provided and populate the ImageRequest object with the proper values", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsiZ3JheXNjYWxlIjp0cnVlfSwib3V0cHV0Rm9ybWF0IjoianBlZyJ9",
        };
        process.env.SOURCE_BUCKETS = "validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "validBucket",
            key: "validKey",
            edits: { grayscale: true },
            outputFormat: "jpeg",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/jpeg",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "validBucket",
            Key: "validKey",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when a default image request is provided and populate the ImageRequest object with the proper values with UTF-8 key", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6IuS4reaWhyIsImVkaXRzIjp7ImdyYXlzY2FsZSI6dHJ1ZX0sIm91dHB1dEZvcm1hdCI6ImpwZWcifQ==",
        };
        process.env = { SOURCE_BUCKETS: "validBucket, validBucket2" };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "validBucket",
            key: "中文",
            edits: { grayscale: true },
            outputFormat: "jpeg",
            originalImage: Buffer.from("SampleImageContent\n"),
            contentType: "image/jpeg",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "validBucket",
            Key: "中文",
        });
        expect(imageRequestInfo).toMatchObject(expectedResult);
    }));
    it("Should pass when a default image request is provided and populate the ImageRequest object with the proper values", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJwbmcifX0=",
        };
        process.env.SOURCE_BUCKETS = "validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "validBucket",
            key: "validKey",
            edits: { toFormat: "png" },
            outputFormat: "png",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/png",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "validBucket",
            Key: "validKey",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when a thumbor image request is provided and populate the ImageRequest object with the proper values", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = { path: "/filters:grayscale()/test-image-001.jpg" };
        process.env.SOURCE_BUCKETS = "allowedBucket001, allowedBucket002";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Thumbor",
            bucket: "allowedBucket001",
            key: "test-image-001.jpg",
            edits: { grayscale: true },
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "allowedBucket001",
            Key: "test-image-001.jpg",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when a thumbor image request is provided and populate the ImageRequest object with the proper values", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/filters:format(png)/filters:quality(50)/test-image-001.jpg",
        };
        process.env.SOURCE_BUCKETS = "allowedBucket001, allowedBucket002";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Thumbor",
            bucket: "allowedBucket001",
            key: "test-image-001.jpg",
            edits: {
                toFormat: "png",
                png: { quality: 50 },
            },
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            outputFormat: "png",
            contentType: "image/png",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "allowedBucket001",
            Key: "test-image-001.jpg",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when a custom image request is provided and populate the ImageRequest object with the proper values", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/filters-rotate(90)/filters-grayscale()/custom-image.jpg",
        };
        process.env = {
            SOURCE_BUCKETS: "allowedBucket001, allowedBucket002",
            REWRITE_MATCH_PATTERN: "/(filters-)/gm",
            REWRITE_SUBSTITUTION: "filters:",
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    CacheControl: "max-age=300,public",
                    ContentType: "custom-type",
                    Expires: "Tue, 24 Dec 2019 13:46:28 GMT",
                    LastModified: "Sat, 19 Dec 2009 16:30:47 GMT",
                    Body: Buffer.from("SampleImageContent\n"),
                });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: lib_1.RequestTypes.CUSTOM,
            bucket: "allowedBucket001",
            key: "custom-image.jpg",
            edits: {
                grayscale: true,
                rotate: 90,
            },
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=300,public",
            contentType: "custom-type",
            expires: "Tue, 24 Dec 2019 13:46:28 GMT",
            lastModified: "Sat, 19 Dec 2009 16:30:47 GMT",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "allowedBucket001",
            Key: "custom-image.jpg",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when a custom image request is provided and populate the ImageRequest object with the proper values and no file extension", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/filters-rotate(90)/filters-grayscale()/custom-image",
        };
        process.env = {
            SOURCE_BUCKETS: "allowedBucket001, allowedBucket002",
            REWRITE_MATCH_PATTERN: "/(filters-)/gm",
            REWRITE_SUBSTITUTION: "filters:",
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    CacheControl: "max-age=300,public",
                    ContentType: "custom-type",
                    Expires: "Tue, 24 Dec 2019 13:46:28 GMT",
                    LastModified: "Sat, 19 Dec 2009 16:30:47 GMT",
                    Body: Buffer.from("SampleImageContent\n"),
                });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: lib_1.RequestTypes.CUSTOM,
            bucket: "allowedBucket001",
            key: "custom-image",
            edits: {
                grayscale: true,
                rotate: 90,
            },
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=300,public",
            contentType: "custom-type",
            expires: "Tue, 24 Dec 2019 13:46:28 GMT",
            lastModified: "Sat, 19 Dec 2009 16:30:47 GMT",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "allowedBucket001",
            Key: "custom-image",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when an error is caught", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsiZ3JheXNjYWxlIjp0cnVlfX0=",
        };
        process.env.SOURCE_BUCKETS = "allowedBucket001, allowedBucket002";
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        // Assert
        try {
            yield imageRequest.setup(event);
        }
        catch (error) {
            expect(error.code).toEqual("ImageBucket::CannotAccessBucket");
        }
    }));
    describe("enableSignature", () => {
        beforeAll(() => {
            process.env.ENABLE_SIGNATURE = "Yes";
            process.env.SECRETS_MANAGER = "serverless-image-handler";
            process.env.SECRET_KEY = "signatureKey";
            process.env.SOURCE_BUCKETS = "validBucket";
        });
        it("Should pass when the image signature is correct", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJwbmcifX0=",
                queryStringParameters: {
                    signature: "4d41311006641a56de7bca8abdbda91af254506107a2c7b338a13ca2fa95eac3",
                },
            };
            // Mock
            mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
                },
            }));
            mock_1.mockAwsSecretManager.getSecretValue.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({
                        SecretString: JSON.stringify({
                            [process.env.SECRET_KEY]: "secret",
                        }),
                    });
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            const imageRequestInfo = yield imageRequest.setup(event);
            const expectedResult = {
                requestType: "Default",
                bucket: "validBucket",
                key: "validKey",
                edits: { toFormat: "png" },
                outputFormat: "png",
                originalImage: Buffer.from("SampleImageContent\n"),
                cacheControl: "max-age=31536000,public",
                contentType: "image/png",
            };
            // Assert
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "validBucket",
                Key: "validKey",
            });
            expect(mock_1.mockAwsSecretManager.getSecretValue).toHaveBeenCalledWith({
                SecretId: process.env.SECRETS_MANAGER,
            });
            expect(imageRequestInfo).toEqual(expectedResult);
        }));
        it("Should throw an error when queryStringParameters are missing", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJwbmcifX0=",
            };
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            try {
                yield imageRequest.setup(event);
            }
            catch (error) {
                // Assert
                expect(error).toMatchObject({
                    status: lib_1.StatusCodes.BAD_REQUEST,
                    code: "AuthorizationQueryParametersError",
                    message: "Query-string requires the signature parameter.",
                });
            }
        }));
        it("Should throw an error when the image signature query parameter is missing", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJwbmcifX0=",
                queryStringParameters: null,
            };
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            try {
                yield imageRequest.setup(event);
            }
            catch (error) {
                // Assert
                expect(error).toMatchObject({
                    status: lib_1.StatusCodes.BAD_REQUEST,
                    message: "Query-string requires the signature parameter.",
                    code: "AuthorizationQueryParametersError",
                });
            }
        }));
        it("Should throw an error when signature does not match", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJwbmcifX0=",
                queryStringParameters: {
                    signature: "invalid",
                },
            };
            // Mock
            mock_1.mockAwsSecretManager.getSecretValue.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({
                        SecretString: JSON.stringify({
                            [process.env.SECRET_KEY]: "secret",
                        }),
                    });
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            try {
                yield imageRequest.setup(event);
            }
            catch (error) {
                // Assert
                expect(mock_1.mockAwsSecretManager.getSecretValue).toHaveBeenCalledWith({
                    SecretId: process.env.SECRETS_MANAGER,
                });
                expect(error).toMatchObject({
                    status: 403,
                    message: "Signature does not match.",
                    code: "SignatureDoesNotMatch",
                });
            }
        }));
        it("Should throw an error when any other error occurs", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJwbmcifX0=",
                queryStringParameters: {
                    signature: "4d41311006641a56de7bca8abdbda91af254506107a2c7b338a13ca2fa95eac3",
                },
            };
            // Mock
            mock_1.mockAwsSecretManager.getSecretValue.mockImplementationOnce(() => ({
                promise() {
                    return Promise.reject(new lib_1.ImageHandlerError(lib_1.StatusCodes.INTERNAL_SERVER_ERROR, "InternalServerError", "SimulatedError"));
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            try {
                yield imageRequest.setup(event);
            }
            catch (error) {
                // Assert
                expect(mock_1.mockAwsSecretManager.getSecretValue).toHaveBeenCalledWith({
                    SecretId: process.env.SECRETS_MANAGER,
                });
                expect(error).toMatchObject({
                    status: lib_1.StatusCodes.INTERNAL_SERVER_ERROR,
                    message: "Signature validation failed.",
                    code: "SignatureValidationFailure",
                });
            }
        }));
    });
    describe("SVGSupport", () => {
        beforeAll(() => {
            process.env.ENABLE_SIGNATURE = "No";
            process.env.SOURCE_BUCKETS = "validBucket";
        });
        it("Should return SVG image when no edit is provided for the SVG image", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/image.svg",
            };
            // Mock
            mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({
                        ContentType: "image/svg+xml",
                        Body: Buffer.from("SampleImageContent\n"),
                    });
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            const imageRequestInfo = yield imageRequest.setup(event);
            const expectedResult = {
                requestType: "Thumbor",
                bucket: "validBucket",
                key: "image.svg",
                edits: {},
                originalImage: Buffer.from("SampleImageContent\n"),
                cacheControl: "max-age=31536000,public",
                contentType: "image/svg+xml",
            };
            // Assert
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "validBucket",
                Key: "image.svg",
            });
            expect(imageRequestInfo).toEqual(expectedResult);
        }));
        it("Should return WebP image when there are any edits and no output is specified for the SVG image", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/100x100/image.svg",
            };
            // Mock
            mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({
                        ContentType: "image/svg+xml",
                        Body: Buffer.from("SampleImageContent\n"),
                    });
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            const imageRequestInfo = yield imageRequest.setup(event);
            const expectedResult = {
                requestType: "Thumbor",
                bucket: "validBucket",
                key: "image.svg",
                edits: { resize: { width: 100, height: 100 } },
                outputFormat: "png",
                originalImage: Buffer.from("SampleImageContent\n"),
                cacheControl: "max-age=31536000,public",
                contentType: "image/png",
            };
            // Assert
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "validBucket",
                Key: "image.svg",
            });
            expect(imageRequestInfo).toEqual(expectedResult);
        }));
        it("Should return JPG image when output is specified to JPG for the SVG image", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const event = {
                path: "/filters:format(jpg)/image.svg",
            };
            // Mock
            mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
                promise() {
                    return Promise.resolve({
                        ContentType: "image/svg+xml",
                        Body: Buffer.from("SampleImageContent\n"),
                    });
                },
            }));
            // Act
            const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
            const imageRequestInfo = yield imageRequest.setup(event);
            const expectedResult = {
                requestType: "Thumbor",
                bucket: "validBucket",
                key: "image.svg",
                edits: { toFormat: "jpeg" },
                outputFormat: "jpeg",
                originalImage: Buffer.from("SampleImageContent\n"),
                cacheControl: "max-age=31536000,public",
                contentType: "image/jpeg",
            };
            // Assert
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "validBucket",
                Key: "image.svg",
            });
            expect(imageRequestInfo).toEqual(expectedResult);
        }));
    });
    it("Should pass and return the customer headers if custom headers are provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const event = {
            path: "/eyJidWNrZXQiOiJ2YWxpZEJ1Y2tldCIsImtleSI6InZhbGlkS2V5IiwiaGVhZGVycyI6eyJDYWNoZS1Db250cm9sIjoibWF4LWFnZT0zMTUzNjAwMCxwdWJsaWMifSwib3V0cHV0Rm9ybWF0IjoianBlZyJ9",
        };
        process.env.SOURCE_BUCKETS = "validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "validBucket",
            key: "validKey",
            headers: { "Cache-Control": "max-age=31536000,public" },
            outputFormat: "jpeg",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/jpeg",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "validBucket",
            Key: "validKey",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass when valid reduction effort is provided and output is webp", () => __awaiter(void 0, void 0, void 0, function* () {
        const event = {
            path: "/eyJidWNrZXQiOiJ0ZXN0Iiwia2V5IjoidGVzdC5wbmciLCJvdXRwdXRGb3JtYXQiOiJ3ZWJwIiwicmVkdWN0aW9uRWZmb3J0IjozfQ==",
        };
        process.env.SOURCE_BUCKETS = "test, validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "test",
            key: "test.png",
            edits: undefined,
            headers: undefined,
            outputFormat: "webp",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/webp",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "test",
            Key: "test.png",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass and use default reduction effort if it is invalid type and output is webp", () => __awaiter(void 0, void 0, void 0, function* () {
        const event = {
            path: "/eyJidWNrZXQiOiJ0ZXN0Iiwia2V5IjoidGVzdC5wbmciLCJvdXRwdXRGb3JtYXQiOiJ3ZWJwIiwicmVkdWN0aW9uRWZmb3J0IjoidGVzdCJ9",
        };
        process.env.SOURCE_BUCKETS = "test, validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "test",
            key: "test.png",
            edits: undefined,
            headers: undefined,
            outputFormat: "webp",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/webp",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "test",
            Key: "test.png",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass and use default reduction effort if it is out of range and output is webp", () => __awaiter(void 0, void 0, void 0, function* () {
        const event = {
            path: "/eyJidWNrZXQiOiJ0ZXN0Iiwia2V5IjoidGVzdC5wbmciLCJvdXRwdXRGb3JtYXQiOiJ3ZWJwIiwicmVkdWN0aW9uRWZmb3J0IjoxMH0=",
        };
        process.env.SOURCE_BUCKETS = "test, validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "test",
            key: "test.png",
            edits: undefined,
            headers: undefined,
            outputFormat: "webp",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/webp",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "test",
            Key: "test.png",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
    it("Should pass and not use reductionEffort if it is not provided and output is webp", () => __awaiter(void 0, void 0, void 0, function* () {
        const event = {
            path: "/eyJidWNrZXQiOiJ0ZXN0Iiwia2V5IjoidGVzdC5wbmciLCJvdXRwdXRGb3JtYXQiOiJ3ZWJwIn0=",
        };
        process.env.SOURCE_BUCKETS = "test, validBucket, validBucket2";
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: Buffer.from("SampleImageContent\n") });
            },
        }));
        // Act
        const imageRequest = new image_request_1.ImageRequest(s3Client, secretProvider);
        const imageRequestInfo = yield imageRequest.setup(event);
        const expectedResult = {
            requestType: "Default",
            bucket: "test",
            key: "test.png",
            edits: undefined,
            headers: undefined,
            outputFormat: "webp",
            originalImage: Buffer.from("SampleImageContent\n"),
            cacheControl: "max-age=31536000,public",
            contentType: "image/webp",
        };
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "test",
            Key: "test.png",
        });
        expect(imageRequestInfo).toEqual(expectedResult);
    }));
});
//# sourceMappingURL=setup.spec.js.map