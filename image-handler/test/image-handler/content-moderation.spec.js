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
// jest spy
const blurSpy = jest.spyOn(sharp_1.default.prototype, "blur");
describe("contentModeration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should pass and blur image with minConfidence provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const buffer = yield image.toBuffer();
        const edits = { contentModeration: { minConfidence: 70 } };
        // Mock
        mock_1.mockAwsRekognition.detectModerationLabels.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    ModerationLabels: [
                        {
                            Confidence: 99.76720428466,
                            Name: "Smoking",
                            ParentName: "Tobacco",
                        },
                        { Confidence: 99.76720428466, Name: "Tobacco", ParentName: "" },
                    ],
                    ModerationModelVersion: "4.0",
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        const expected = image.blur(50);
        // Assert
        expect(mock_1.mockAwsRekognition.detectModerationLabels).toHaveBeenCalledWith({
            Image: { Bytes: buffer },
            MinConfidence: 70,
        });
        expect(result["options"].input).not.toEqual(originalImage); // eslint-disable-line dot-notation
        expect(result).toEqual(expected);
    }));
    it("should pass and blur to specified amount if blur option is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const buffer = yield image.toBuffer();
        const edits = {
            contentModeration: { minConfidence: 75, blur: 100 },
        };
        // Mock
        mock_1.mockAwsRekognition.detectModerationLabels.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    ModerationLabels: [
                        {
                            Confidence: 99.76720428466,
                            Name: "Smoking",
                            ParentName: "Tobacco",
                        },
                        { Confidence: 99.76720428466, Name: "Tobacco", ParentName: "" },
                    ],
                    ModerationModelVersion: "4.0",
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        const expected = image.blur(100);
        // Assert
        expect(mock_1.mockAwsRekognition.detectModerationLabels).toHaveBeenCalledWith({
            Image: { Bytes: buffer },
            MinConfidence: 75,
        });
        expect(result["options"].input).not.toEqual(originalImage); // eslint-disable-line dot-notation
        expect(result).toEqual(expected);
    }));
    it("should pass and blur if content moderation label matches specified moderation label", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const buffer = yield image.toBuffer();
        const edits = {
            contentModeration: { moderationLabels: ["Smoking"] },
        };
        // Mock
        mock_1.mockAwsRekognition.detectModerationLabels.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    ModerationLabels: [
                        {
                            Confidence: 99.76720428466,
                            Name: "Smoking",
                            ParentName: "Tobacco",
                        },
                        { Confidence: 99.76720428466, Name: "Tobacco", ParentName: "" },
                    ],
                    ModerationModelVersion: "4.0",
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        const expected = image.blur(50);
        // Assert
        expect(mock_1.mockAwsRekognition.detectModerationLabels).toHaveBeenCalledWith({
            Image: { Bytes: buffer },
            MinConfidence: 75,
        });
        expect(result["options"].input).not.toEqual(originalImage); // eslint-disable-line dot-notation
        expect(result).toEqual(expected);
    }));
    it("should not blur if provided moderationLabels not found", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const buffer = yield image.toBuffer();
        const edits = {
            contentModeration: {
                minConfidence: 80,
                blur: 100,
                moderationLabels: ["Alcohol"],
            },
        };
        // Mock
        mock_1.mockAwsRekognition.detectModerationLabels.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    ModerationLabels: [
                        {
                            Confidence: 99.76720428466,
                            Name: "Smoking",
                            ParentName: "Tobacco",
                        },
                        { Confidence: 99.76720428466, Name: "Tobacco", ParentName: "" },
                    ],
                    ModerationModelVersion: "4.0",
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        expect(mock_1.mockAwsRekognition.detectModerationLabels).toHaveBeenCalledWith({
            Image: { Bytes: buffer },
            MinConfidence: 80,
        });
        expect(result).toEqual(image);
    }));
    it("Should pass and blur image when no parameters passed", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = fs_1.default.readFileSync("./test/image/aws_logo.png");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const buffer = yield image.toBuffer();
        const edits = { contentModeration: true };
        // Mock
        mock_1.mockAwsRekognition.detectModerationLabels.mockImplementationOnce(() => ({
            promise() {
                return Promise.resolve({
                    ModerationLabels: [
                        {
                            Confidence: 99.76720428466,
                            Name: "Fake Name",
                            ParentName: "Fake Parent Name",
                        },
                        { Confidence: 99.76720428466, Name: "Fake Name", ParentName: "" },
                    ],
                    ModerationModelVersion: "5.0",
                });
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield (yield imageHandler.applyEdits(image, edits, false)).toBuffer();
        const expected = yield (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata().blur(50).toBuffer();
        // Assert
        expect(mock_1.mockAwsRekognition.detectModerationLabels).toHaveBeenCalledWith({
            Image: { Bytes: buffer },
            MinConfidence: 75,
        });
        expect(result).toEqual(expected);
    }));
    it("should fail if rekognition returns an error", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const buffer = yield image.toBuffer();
        const edits = {
            contentModeration: { minConfidence: 90, blur: 100 },
        };
        // Mock
        mock_1.mockAwsRekognition.detectModerationLabels.mockImplementationOnce(() => ({
            promise() {
                return Promise.reject(new lib_1.ImageHandlerError(lib_1.StatusCodes.INTERNAL_SERVER_ERROR, "InternalServerError", "Amazon Rekognition experienced a service issue. Try your call again."));
            },
        }));
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        try {
            yield imageHandler.applyEdits(image, edits, false);
        }
        catch (error) {
            // Assert
            expect(mock_1.mockAwsRekognition.detectModerationLabels).toHaveBeenCalledWith({
                Image: { Bytes: buffer },
                MinConfidence: 90,
            });
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.INTERNAL_SERVER_ERROR,
                code: "InternalServerError",
                message: "Amazon Rekognition experienced a service issue. Try your call again.",
            });
        }
    }));
});
describe("blurImage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should blur to specified value if the specified labels match the found rekognition moderation labels", () => {
        // Arrange
        const currentImage = Buffer.from("TestImageData");
        const image = (0, sharp_1.default)(currentImage, { failOnError: false }).withMetadata();
        const rekognitionResponse = {
            ModerationLabels: [
                {
                    Confidence: 99.24723052978516,
                    ParentName: "Rude Gestures",
                    Name: "Middle Finger",
                },
                {
                    Confidence: 99.24723052978516,
                    ParentName: "Alcohol",
                    Name: "Drinking",
                },
            ],
        };
        const moderationLabels = ["Middle Finger"];
        const blurValue = 0.5;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        imageHandler["blurImage"](image, blurValue, moderationLabels, rekognitionResponse);
        // Assert
        expect(blurSpy).toHaveBeenCalledWith(Math.ceil(blurValue));
    });
    it("should blur if no labels were provided but moderation content was found", () => {
        // Arrange
        const currentImage = Buffer.from("TestImageData");
        const image = (0, sharp_1.default)(currentImage, { failOnError: false }).withMetadata();
        const rekognitionResponse = {
            ModerationLabels: [
                {
                    Confidence: 99.24723052978516,
                    ParentName: "Rude Gestures",
                    Name: "Middle Finger",
                },
                {
                    Confidence: 99.24723052978516,
                    ParentName: "Alcohol",
                    Name: "Drinking",
                },
            ],
        };
        const moderationLabels = undefined;
        const blurValue = 2;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        imageHandler["blurImage"](image, blurValue, moderationLabels, rekognitionResponse);
        // Assert
        expect(blurSpy).toHaveBeenCalledWith(Math.ceil(blurValue));
    });
    it("should not blur if labels were provided but do not match found rekognition content", () => {
        // Arrange
        const currentImage = Buffer.from("TestImageData");
        const image = (0, sharp_1.default)(currentImage, { failOnError: false }).withMetadata();
        const rekognitionResponse = {
            ModerationLabels: [
                {
                    Confidence: 99.24723052978516,
                    ParentName: "Rude Gestures",
                    Name: "Middle Finger",
                },
                {
                    Confidence: 99.24723052978516,
                    ParentName: "Alcohol",
                    Name: "Drinking",
                },
            ],
        };
        const moderationLabels = ["Smoking"];
        const blurValue = 2;
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        imageHandler["blurImage"](image, blurValue, moderationLabels, rekognitionResponse);
        // Assert
        expect(blurSpy).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=content-moderation.spec.js.map