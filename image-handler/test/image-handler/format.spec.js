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
const rekognition_1 = __importDefault(require("aws-sdk/clients/rekognition"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const image_handler_1 = require("../../image-handler");
const lib_1 = require("../../lib");
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
const image = fs_1.default.readFileSync("./test/image/25x15.png");
describe("format", () => {
    it("Should pass if the output image is in a different format than the original image", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.jpg",
            outputFormat: lib_1.ImageFormatTypes.PNG,
            edits: { grayscale: true, flip: true },
            originalImage: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        expect(result).not.toEqual(request.originalImage);
    }));
    it("Should pass if the output image is webp format and reductionEffort is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.jpg",
            outputFormat: lib_1.ImageFormatTypes.WEBP,
            effort: 3,
            originalImage: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
        };
        jest.spyOn((0, sharp_1.default)(), "webp");
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        expect(result).not.toEqual(request.originalImage);
    }));
    it("Should pass if the output image is different from the input image with edits applied", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.jpg",
            edits: { grayscale: true, flip: true },
            originalImage: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        expect(result).not.toEqual(request.originalImage);
    }));
});
describe("modifyImageOutput", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should return an image in the specified format when outputFormat is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.png",
            edits: { grayscale: true, flip: true },
            outputFormat: lib_1.ImageFormatTypes.JPEG,
            originalImage: image,
        };
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const sharpImage = (0, sharp_1.default)(request.originalImage, { failOnError: false }).withMetadata();
        const toFormatSpy = jest.spyOn(sharp_1.default.prototype, "toFormat");
        const result = yield imageHandler["modifyImageOutput"](sharpImage, request).toBuffer();
        // Act
        const resultFormat = (yield (0, sharp_1.default)(result).metadata()).format;
        // Assert
        expect(toFormatSpy).toHaveBeenCalledWith("jpeg");
        expect(resultFormat).toEqual(lib_1.ImageFormatTypes.JPEG);
    }));
    it("Should return an image in the same format when outputFormat is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.png",
            edits: { grayscale: true, flip: true },
            originalImage: image,
        };
        const sharpImage = (0, sharp_1.default)(request.originalImage, { failOnError: false }).withMetadata();
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = yield imageHandler["modifyImageOutput"](sharpImage, request).toBuffer();
        const resultFormat = (yield (0, sharp_1.default)(result).metadata()).format;
        // Assert
        expect(resultFormat).toEqual(lib_1.ImageFormatTypes.PNG);
    }));
    it("Should return an image webp with reduction effort when outputFormat wepb and reduction effot provided", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.png",
            edits: { grayscale: true, flip: true },
            outputFormat: lib_1.ImageFormatTypes.WEBP,
            effort: 3,
            originalImage: image,
        };
        const sharpImage = (0, sharp_1.default)(request.originalImage, { failOnError: false }).withMetadata();
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const webpSpy = jest.spyOn(sharp_1.default.prototype, "webp");
        // Act
        const result = yield imageHandler["modifyImageOutput"](sharpImage, request).toBuffer();
        const resultFormat = (yield (0, sharp_1.default)(result).metadata()).format;
        // Assert
        expect(webpSpy).toHaveBeenCalledWith({ effort: request.effort });
        expect(resultFormat).toEqual(lib_1.ImageFormatTypes.WEBP);
    }));
});
//# sourceMappingURL=format.spec.js.map