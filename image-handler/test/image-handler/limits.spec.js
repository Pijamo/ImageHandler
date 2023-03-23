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
const image_handler_1 = require("../../image-handler");
const lib_1 = require("../../lib");
const s3Client = new s3_1.default();
const rekognitionClient = new rekognition_1.default();
describe("limits", () => {
    it("Should fail the return payload is larger than 6MB", () => __awaiter(void 0, void 0, void 0, function* () {
        // Arrange
        const request = {
            requestType: lib_1.RequestTypes.DEFAULT,
            bucket: "sample-bucket",
            key: "sample-image-001.jpg",
            originalImage: Buffer.alloc(6 * 1024 * 1024),
        };
        // Act
        const imageHandler = new image_handler_1.ImageHandler(s3Client, rekognitionClient);
        try {
            yield imageHandler.process(request);
        }
        catch (error) {
            // Assert
            expect(error).toMatchObject({
                status: lib_1.StatusCodes.REQUEST_TOO_LONG,
                code: "TooLargeImageException",
                message: "The converted image is too large to return.",
            });
        }
    }));
});
//# sourceMappingURL=limits.spec.js.map