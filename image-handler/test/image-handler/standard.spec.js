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
const lib_1 = require("../../lib");
const fs_1 = __importDefault(require("fs"));
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
const image = fs_1.default.readFileSync("./test/image/25x15.png");
const withMetatdataSpy = jest.spyOn(sharp_1.default.prototype, "withMetadata");
describe("standard", () => {
    it("Should pass if a series of standard edits are provided to the function", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const originalImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
        const image = (0, sharp_1.default)(originalImage, { failOnError: false }).withMetadata();
        const edits = { grayscale: true, flip: true };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.applyEdits(image, edits, false);
        // Assert
        /* eslint-disable dot-notation */
        const expectedResult1 = result["options"].greyscale;
        const expectedResult2 = result["options"].flip;
        const combinedResults = expectedResult1 && expectedResult2;
        expect(combinedResults).toEqual(true);
    }));
    it("Should pass if no edits are specified and the original image is returned", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.jpg",
            originalImage: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"),
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        const result = yield imageHandler.process(request);
        // Assert
        expect(result).toEqual(request.originalImage.toString("base64"));
    }));
});
describe("instantiateSharpImage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("Should not include metadata if the rotation is null", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const edits = {
            rotate: null,
        };
        const options = { faiOnError: false };
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        yield imageHandler["instantiateSharpImage"](image, edits, options);
        //Assert
        expect(withMetatdataSpy).not.toHaveBeenCalled();
    }));
    it("Should include metadata and not define orientation if the rotation is not null and orientation is not defined", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const edits = {
            rotate: undefined,
        };
        const options = { faiOnError: false };
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        yield imageHandler["instantiateSharpImage"](image, edits, options);
        //Assert
        expect(withMetatdataSpy).toHaveBeenCalled();
        expect(withMetatdataSpy).not.toHaveBeenCalledWith(expect.objectContaining({ orientation: expect.anything }));
    }));
    it("Should include orientation metadata if the rotation is defined in the metadata", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const edits = {
            rotate: undefined,
        };
        const options = { faiOnError: false };
        const modifiedImage = yield (0, sharp_1.default)(image).withMetadata({ orientation: 1 }).toBuffer();
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        // Act
        yield imageHandler["instantiateSharpImage"](modifiedImage, edits, options);
        //Assert
        expect(withMetatdataSpy).toHaveBeenCalledWith({ orientation: 1 });
    }));
});
//# sourceMappingURL=standard.spec.js.map