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
const rekognition_1 = __importDefault(require("aws-sdk/clients/rekognition"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const image_handler_1 = require("../../image-handler");
const lib_1 = require("../../lib");
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
describe("overlay", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("Should pass if an edit with the overlayWith keyname is passed to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            overlayWith: { bucket: "bucket", key: "key" },
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "bucket",
            Key: "key",
        });
        expect(result["options"].input.buffer).toEqual(originalImage); // eslint-disable-line dot-notation
    }));
    it("Should pass if an edit with the overlayWith keyname is passed to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            overlayWith: {
                bucket: "bucket",
                key: "key",
                options: { left: "-1", top: "-1" },
            },
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "bucket",
            Key: "key",
        });
        expect(result["options"].input.buffer).toEqual(originalImage); // eslint-disable-line dot-notation
    }));
    it("Should pass if an edit with the overlayWith keyname is passed to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            overlayWith: {
                bucket: "bucket",
                key: "key",
                options: { left: "1", top: "1" },
            },
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "bucket",
            Key: "key",
        });
        expect(result["options"].input.buffer).toEqual(originalImage); // eslint-disable-line dot-notation
    }));
    it("Should pass if an edit with the overlayWith keyname is passed to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            overlayWith: {
                bucket: "bucket",
                key: "key",
                options: { left: "50p", top: "50p" },
            },
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "bucket",
            Key: "key",
        });
        expect(result["options"].input.buffer).toEqual(originalImage); // eslint-disable-line dot-notation
    }));
    it("Should pass if an edit with the overlayWith keyname contains position which could produce float number", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = fs_1.default.readFileSync("./test/image/25x15.png");
        const overlayImage = fs_1.default.readFileSync("./test/image/1x1.jpg");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            overlayWith: {
                bucket: "bucket",
                key: "key",
                options: { left: "25.5p", top: "25.5p" },
            },
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: overlayImage });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        const metadata = yield result.metadata();
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "bucket",
            Key: "key",
        });
        expect(metadata.width).toEqual(25);
        expect(metadata.height).toEqual(15);
        expect(result.toBuffer()).not.toEqual(originalImage);
    }));
    it("Should pass if an edit with the overlayWith keyname is passed to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            overlayWith: {
                bucket: "bucket",
                key: "key",
                options: { left: "-50p", top: "-50p" },
            },
        };
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "bucket",
            Key: "key",
        });
        expect(result["options"].input.buffer).toEqual(originalImage); // eslint-disable-line dot-notation
    }));
    it("Should pass if the proper bucket name and key are supplied, simulating an image file that can be retrieved", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const metadata = yield (0, sharp_1.default)(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64")).metadata();
        const result = yield imageHandler.getOverlayImage("validBucket", "validKey", "100", "100", "20", metadata);
        // Assert
        expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
            Bucket: "validBucket",
            Key: "validKey",
        });
        expect(result).toEqual(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAADUlEQVR4nGP4z8CQCgAEZgFltQhIfQAAAABJRU5ErkJggg==", "base64"));
    }));
    it("Should pass and do not throw an exception that the overlay image dimensions are not integer numbers", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock
        const originalImage = fs_1.default.readFileSync("./test/image/25x15.png");
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({ Body: originalImage });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const originalImageMetadata = yield (0, sharp_1.default)(originalImage).metadata();
        const result = yield imageHandler.getOverlayImage("bucket", "key", "75", "75", "20", originalImageMetadata);
        const overlayImageMetadata = yield (0, sharp_1.default)(result).metadata();
        // Assert
        expect(overlayImageMetadata.width).toEqual(18);
        expect(overlayImageMetadata.height).toEqual(11);
    }));
    it("Should throw an error if an invalid bucket or key name is provided, simulating a nonexistent overlay image", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock
        mock_1.mockAwsS3.getObject.mockImplementationOnce(() => ({
            promise() {
                return Promise.reject(new lib_1.ImageHandlerError(lib_1.StatusCodes.INTERNAL_SERVER_ERROR, "InternalServerError", "SimulatedInvalidParameterException"));
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const metadata = yield (0, sharp_1.default)(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64")).metadata();
        try {
            yield imageHandler.getOverlayImage("invalidBucket", "invalidKey", "100", "100", "20", metadata);
        }
        catch (error) {
            // Assert
            expect(mock_1.mockAwsS3.getObject).toHaveBeenCalledWith({
                Bucket: "invalidBucket",
                Key: "invalidKey",
            });
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.INTERNAL_SERVER_ERROR,
                code: "InternalServerError",
                message: "SimulatedInvalidParameterException",
            });
        }
    }));
});
describe("calcOverlaySizeOption", () => {
    it('should return percentage of imagesize when parameter ends in "p"', () => {
        // Arrange
        const imageSize = 100;
        const editSize = "50p";
        const overlaySize = 10;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["calcOverlaySizeOption"](editSize, imageSize, overlaySize);
        // Assert
        expect(result).toEqual(50);
    });
    it('should return the image size plus the percentage minus the overlay size if param is less than 1 and ends in "p"', () => {
        // Arrange
        const imageSize = 100;
        const editSize = "-50p";
        const overlaySize = 50;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["calcOverlaySizeOption"](editSize, imageSize, overlaySize);
        // Assert
        expect(result).toEqual(0);
    });
    it("should return the specified parameter if param is a positive number", () => {
        // Arrange
        const imageSize = 100;
        const editSize = "50";
        const overlaySize = 50;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["calcOverlaySizeOption"](editSize, imageSize, overlaySize);
        // Assert
        expect(result).toEqual(50);
    });
    it("should return the image size + specified parameter - overlay size if param is less than 0", () => {
        // Arrange
        const imageSize = 100;
        const editSize = "-50";
        const overlaySize = 50;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["calcOverlaySizeOption"](editSize, imageSize, overlaySize);
        // Assert
        expect(result).toEqual(0);
    });
    it("should return NaN if param is undefined", () => {
        // Arrange
        const imageSize = 100;
        const editSize = undefined;
        const overlaySize = 50;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["calcOverlaySizeOption"](editSize, imageSize, overlaySize);
        // Assert
        expect(result).toEqual(NaN);
    });
});
//# sourceMappingURL=overlay.spec.js.map