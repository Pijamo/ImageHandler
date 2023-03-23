"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
const lib_1 = require("../../lib");
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
describe("crop", () => {
    it("Should pass if a cropping area value is out of bounds", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = {
            crop: { left: 0, right: 0, width: 100, height: 100 },
        };
        // Act
        try {
            const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
            yield imageHandler.applyEdits(image, edits, false);
        }
        catch (error) {
            // Assert
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.BAD_REQUEST,
                code: "Crop::AreaOutOfBounds",
                message: "The cropping area you provided exceeds the boundaries of the original image. Please try choosing a correct cropping value.",
            });
        }
    }));
});
//# sourceMappingURL=crop.spec.js.map