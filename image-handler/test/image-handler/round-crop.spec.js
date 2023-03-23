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
const image_handler_1 = require("../../image-handler");
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
//jest spies
const hasRoundCropSpy = jest.spyOn(image_handler_1.ImageHandler.prototype, "hasRoundCrop");
const validRoundCropParamSpy = jest.spyOn(image_handler_1.ImageHandler.prototype, "validRoundCropParam");
const compositeSpy = jest.spyOn(sharp_1.default.prototype, "composite");
describe("roundCrop", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should pass if roundCrop keyName is passed with no additional options", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const metadata = yield image.metadata();
        const edits = { roundCrop: true };
        const radiusX = Math.min(metadata.height, metadata.width) / 2;
        const radiusY = radiusX;
        const height = metadata.height;
        const width = metadata.width;
        const leftOffset = metadata.width / 2;
        const topOffset = metadata.height / 2;
        const ellipse = Buffer.from(`<svg viewBox="0 0 ${width} ${height}"> <ellipse cx="${leftOffset}" cy="${topOffset}" rx="${radiusX}" ry="${radiusY}" /></svg>`);
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        const expectedResult = { width: metadata.width / 2, height: metadata.height / 2 };
        expect(result["options"].input).not.toEqual(expectedResult);
        expect(hasRoundCropSpy).toHaveReturnedWith(true);
        expect(validRoundCropParamSpy).toHaveBeenCalledTimes(4);
        for (let i = 1; i <= 4; i++) {
            expect(validRoundCropParamSpy).toHaveNthReturnedWith(i, undefined);
        }
        expect(compositeSpy).toHaveBeenCalledWith([{ input: ellipse, blend: "dest-in" }]);
    }));
    it("Should pass if roundCrop keyName is passed with additional options", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAEAAQDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const metadata = yield image.metadata();
        const edits = { roundCrop: { top: 100, left: 100, rx: 100, ry: 100 } };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        const expectedResult = { width: metadata.width / 2, height: metadata.height / 2 };
        expect(result["options"].input).not.toEqual(expectedResult);
        expect(hasRoundCropSpy).toHaveReturnedWith(true);
        expect(validRoundCropParamSpy).toHaveReturnedWith(true);
        expect(compositeSpy).toHaveBeenCalled();
    }));
});
describe("hasRoundCrop", () => {
    it("Should return true when the edits object has roundCrop key", () => {
        // Arrange
        const edits = { roundCrop: { top: 100, left: 100, rx: 100, ry: 100 } };
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["hasRoundCrop"](edits);
        // Assert
        expect(result).toBe(true);
    });
    it("should return false when the edits object does not have roundCrop key", () => {
        // Arrange
        const edits = { resize: { width: 50, height: 50 } };
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["hasRoundCrop"](edits);
        // Assert
        expect(result).toBe(false);
    });
});
describe("validRoundCropParam", () => {
    it("Should return true when the input is a number greater than 0", () => {
        // Arrange
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["validRoundCropParam"](2);
        // Assert
        expect(result).toBe(true);
    });
    it("Should return false when the input is a number less than 0", () => {
        // Arrange
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["validRoundCropParam"](-1);
        // Assert
        expect(result).toBe(false);
    });
    it("Should return falsey value when the input is undefined", () => {
        // Arrange
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        const result = imageHandler["validRoundCropParam"](undefined);
        // Assert
        // Converted to bool to show falsey values would be false as the parameters is used in if expression.
        expect(!!result).toBe(false);
    });
});
//# sourceMappingURL=round-crop.spec.js.map