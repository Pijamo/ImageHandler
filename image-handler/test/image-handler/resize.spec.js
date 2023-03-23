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
describe("resize", () => {
    it("Should pass if resize width and height are provided as string number to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = { resize: { width: "99.1", height: "99.9" } };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        const resultBuffer = yield result.toBuffer();
        const convertedImage = yield (0, sharp_1.default)(originalImage, { failOnError: false })
            .withMetadata()
            .resize({ width: 99, height: 100 })
            .toBuffer();
        expect(resultBuffer).toEqual(convertedImage);
    }));
});
//# sourceMappingURL=resize.spec.js.map