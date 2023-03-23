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
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const image_handler_1 = require("../../image-handler");
const lib_1 = require("../../lib");
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
describe("rotate", () => {
    it("Should pass if rotate is null and return image without EXIF and ICC", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = fs_1.default.readFileSync("./test/image/1x1.jpg");
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "test.jpg",
            edits: { rotate: null },
            originalImage: originalImage,
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        const metadata = yield (0, sharp_1.default)(Buffer.from(result, "base64")).metadata();
        expect(metadata).not.toHaveProperty("exif");
        expect(metadata).not.toHaveProperty("icc");
        expect(metadata).not.toHaveProperty("orientation");
    }));
    it("Should pass if the original image has orientation", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = fs_1.default.readFileSync("./test/image/1x1.jpg");
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "test.jpg",
            edits: {},
            originalImage: originalImage,
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        const metadata = yield (0, sharp_1.default)(Buffer.from(result, "base64")).metadata();
        expect(metadata).toHaveProperty("icc");
        expect(metadata).toHaveProperty("exif");
        expect(metadata.orientation).toEqual(3);
    }));
    it("Should pass if the original image does not have orientation", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "test.jpg",
            edits: {},
            originalImage: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        const metadata = yield (0, sharp_1.default)(Buffer.from(result, "base64")).metadata();
        expect(metadata).not.toHaveProperty("orientation");
    }));
});
//# sourceMappingURL=rotate.spec.js.map