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
exports.ImageHandler = void 0;
const sharp_1 = __importDefault(require("sharp"));
const lib_1 = require("./lib");
class ImageHandler {
    constructor(s3Client, rekognitionClient) {
        this.s3Client = s3Client;
        this.rekognitionClient = rekognitionClient;
        this.LAMBDA_PAYLOAD_LIMIT = 6 * 1024 * 1024;
        /**
         *
         * @param editSize the specified size
         * @param imageSize the size of the image
         * @param overlaySize the size of the overlay
         * @returns the calculated size
         */
        this.calcOverlaySizeOption = (editSize, imageSize, overlaySize) => {
            let resultSize = NaN;
            if (editSize !== undefined) {
                // if ends with p, it is a percentage
                if (editSize.endsWith("p")) {
                    resultSize = parseInt(editSize.replace("p", ""));
                    resultSize = Math.floor(resultSize < 0 ? imageSize + (imageSize * resultSize) / 100 - overlaySize : (imageSize * resultSize) / 100);
                }
                else {
                    resultSize = parseInt(editSize);
                    if (resultSize < 0) {
                        resultSize = imageSize + resultSize - overlaySize;
                    }
                }
            }
            return resultSize;
        };
    }
    /**
     * Creates a Sharp object from Buffer
     * @param originalImage An image buffer.
     * @param edits The edits to be applied to an image
     * @param options Additional sharp options to be applied
     * @returns A Sharp image object
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    instantiateSharpImage(originalImage, edits, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let image = null;
            if (edits.rotate !== undefined && edits.rotate === null) {
                image = (0, sharp_1.default)(originalImage, options);
            }
            else {
                const metadata = yield (0, sharp_1.default)(originalImage, options).metadata();
                image = metadata.orientation
                    ? (0, sharp_1.default)(originalImage, options).withMetadata({ orientation: metadata.orientation })
                    : (0, sharp_1.default)(originalImage, options).withMetadata();
            }
            return image;
        });
    }
    /**
     * Modify an image's output format if specified
     * @param modifiedImage the image object.
     * @param imageRequestInfo the image request
     * @returns A Sharp image object
     */
    modifyImageOutput(modifiedImage, imageRequestInfo) {
        const modifiedOutputImage = modifiedImage;
        // modify if specified
        if (imageRequestInfo.outputFormat !== undefined) {
            // Include reduction effort for webp images if included
            if (imageRequestInfo.outputFormat === lib_1.ImageFormatTypes.WEBP && typeof imageRequestInfo.effort !== "undefined") {
                modifiedOutputImage.webp({ effort: imageRequestInfo.effort });
            }
            else {
                modifiedOutputImage.toFormat(ImageHandler.convertImageFormatType(imageRequestInfo.outputFormat));
            }
        }
        return modifiedOutputImage;
    }
    /**
     * Main method for processing image requests and outputting modified images.
     * @param imageRequestInfo An image request.
     * @returns Processed and modified image encoded as base64 string.
     */
    process(imageRequestInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { originalImage, edits } = imageRequestInfo;
            const options = { failOnError: false, animated: imageRequestInfo.contentType === lib_1.ContentTypes.GIF };
            let base64EncodedImage = "";
            // Apply edits if specified
            if (edits && Object.keys(edits).length) {
                // convert image to Sharp object
                const image = yield this.instantiateSharpImage(originalImage, edits, options);
                // apply image edits
                let modifiedImage = yield this.applyEdits(image, edits, options.animated);
                // modify image output if requested
                modifiedImage = this.modifyImageOutput(modifiedImage, imageRequestInfo);
                // convert to base64 encoded string
                const imageBuffer = yield modifiedImage.toBuffer();
                base64EncodedImage = imageBuffer.toString("base64");
            }
            else {
                if (imageRequestInfo.outputFormat !== undefined) {
                    // convert image to Sharp and change output format if specified
                    const modifiedImage = this.modifyImageOutput((0, sharp_1.default)(originalImage, options), imageRequestInfo);
                    // convert to base64 encoded string
                    const imageBuffer = yield modifiedImage.toBuffer();
                    base64EncodedImage = imageBuffer.toString("base64");
                }
                else {
                    // no edits or output format changes, convert to base64 encoded image
                    base64EncodedImage = originalImage.toString("base64");
                }
            }
            // binary data need to be base64 encoded to pass to the API Gateway proxy https://docs.aws.amazon.com/apigateway/latest/developerguide/lambda-proxy-binary-media.html.
            // checks whether base64 encoded image fits in 6M limit, see https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html.
            if (base64EncodedImage.length > this.LAMBDA_PAYLOAD_LIMIT) {
                throw new lib_1.ImageHandlerError(lib_1.StatusCodes.REQUEST_TOO_LONG, "TooLargeImageException", "The converted image is too large to return.");
            }
            return base64EncodedImage;
        });
    }
    /**
     * Applies image modifications to the original image based on edits.
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     * @param isAnimation a flag whether the edit applies to `gif` file or not.
     * @returns A modifications to the original image.
     */
    applyEdits(originalImage, edits, isAnimation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.applyResize(originalImage, edits);
            // Apply the image edits
            for (const edit in edits) {
                if (this.skipEdit(edit, isAnimation))
                    continue;
                switch (edit) {
                    case "overlayWith": {
                        yield this.applyOverlayWith(originalImage, edits);
                        break;
                    }
                    case "smartCrop": {
                        yield this.applySmartCrop(originalImage, edits);
                        break;
                    }
                    case "roundCrop": {
                        originalImage = yield this.applyRoundCrop(originalImage, edits);
                        break;
                    }
                    case "contentModeration": {
                        yield this.applyContentModeration(originalImage, edits);
                        break;
                    }
                    case "crop": {
                        this.applyCrop(originalImage, edits);
                        break;
                    }
                    default: {
                        if (edit in originalImage) {
                            originalImage[edit](edits[edit]);
                        }
                    }
                }
            }
            // Return the modified image
            return originalImage;
        });
    }
    /**
     * Applies resize edit.
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     */
    applyResize(originalImage, edits) {
        return __awaiter(this, void 0, void 0, function* () {
            if (edits.resize === undefined) {
                edits.resize = {};
                edits.resize.fit = lib_1.ImageFitTypes.INSIDE;
            }
            else {
                if (edits.resize.width)
                    edits.resize.width = Math.round(Number(edits.resize.width));
                if (edits.resize.height)
                    edits.resize.height = Math.round(Number(edits.resize.height));
                if (edits.resize.ratio) {
                    const ratio = edits.resize.ratio;
                    const { width, height } = edits.resize.width && edits.resize.height ? edits.resize : yield originalImage.metadata();
                    edits.resize.width = Math.round(width * ratio);
                    edits.resize.height = Math.round(height * ratio);
                    // Sharp doesn't have such parameter for resize(), we got it from Thumbor mapper.  We don't need to keep this field in the `resize` object
                    delete edits.resize.ratio;
                    if (!edits.resize.fit)
                        edits.resize.fit = lib_1.ImageFitTypes.INSIDE;
                }
            }
        });
    }
    /**
     * Applies overlay edit.
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     */
    applyOverlayWith(originalImage, edits) {
        return __awaiter(this, void 0, void 0, function* () {
            let imageMetadata = yield originalImage.metadata();
            if (edits.resize) {
                const imageBuffer = yield originalImage.toBuffer();
                const resizeOptions = edits.resize;
                imageMetadata = yield (0, sharp_1.default)(imageBuffer).resize(resizeOptions).metadata();
            }
            const { bucket, key, wRatio, hRatio, alpha, options } = edits.overlayWith;
            const overlay = yield this.getOverlayImage(bucket, key, wRatio, hRatio, alpha, imageMetadata);
            const overlayMetadata = yield (0, sharp_1.default)(overlay).metadata();
            const overlayOption = Object.assign(Object.assign({}, options), { input: overlay });
            if (options) {
                const { left: leftOption, top: topOption } = options;
                const left = this.calcOverlaySizeOption(leftOption, imageMetadata.width, overlayMetadata.width);
                if (!isNaN(left))
                    overlayOption.left = left;
                const top = this.calcOverlaySizeOption(topOption, imageMetadata.height, overlayMetadata.height);
                if (!isNaN(top))
                    overlayOption.top = top;
            }
            originalImage.composite([overlayOption]);
        });
    }
    /**
     * Applies smart crop edit.
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     */
    applySmartCrop(originalImage, edits) {
        return __awaiter(this, void 0, void 0, function* () {
            // smart crop can be boolean or object
            if (edits.smartCrop === true || typeof edits.smartCrop === "object") {
                const { faceIndex, padding } = typeof edits.smartCrop === "object"
                    ? edits.smartCrop
                    : {
                        faceIndex: undefined,
                        padding: undefined,
                    };
                const { imageBuffer, format } = yield this.getRekognitionCompatibleImage(originalImage);
                const boundingBox = yield this.getBoundingBox(imageBuffer.data, faceIndex !== null && faceIndex !== void 0 ? faceIndex : 0);
                const cropArea = this.getCropArea(boundingBox, padding !== null && padding !== void 0 ? padding : 0, imageBuffer.info);
                try {
                    originalImage.extract(cropArea);
                    // convert image back to previous format
                    if (format !== imageBuffer.info.format) {
                        originalImage.toFormat(format);
                    }
                }
                catch (error) {
                    throw new lib_1.ImageHandlerError(lib_1.StatusCodes.BAD_REQUEST, "SmartCrop::PaddingOutOfBounds", "The padding value you provided exceeds the boundaries of the original image. Please try choosing a smaller value or applying padding via Sharp for greater specificity.");
                }
            }
        });
    }
    /**
     * Determines if the edits specified contain a valid roundCrop item
     * @param edits The edits speficed
     * @returns boolean
     */
    hasRoundCrop(edits) {
        return edits.roundCrop === true || typeof edits.roundCrop === "object";
    }
    /**
     * @param param Value of corner to check
     * @returns Boolean identifying whether roundCrop parameters are valid
     */
    validRoundCropParam(param) {
        return param && param >= 0;
    }
    /**
     * Applies round crop edit.
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     */
    applyRoundCrop(originalImage, edits) {
        return __awaiter(this, void 0, void 0, function* () {
            // round crop can be boolean or object
            if (this.hasRoundCrop(edits)) {
                const { top, left, rx, ry } = typeof edits.roundCrop === "object"
                    ? edits.roundCrop
                    : {
                        top: undefined,
                        left: undefined,
                        rx: undefined,
                        ry: undefined,
                    };
                const imageBuffer = yield originalImage.toBuffer({ resolveWithObject: true });
                const width = imageBuffer.info.width;
                const height = imageBuffer.info.height;
                // check for parameters, if not provided, set to defaults
                const radiusX = this.validRoundCropParam(rx) ? rx : Math.min(width, height) / 2;
                const radiusY = this.validRoundCropParam(ry) ? ry : Math.min(width, height) / 2;
                const topOffset = this.validRoundCropParam(top) ? top : height / 2;
                const leftOffset = this.validRoundCropParam(left) ? left : width / 2;
                const ellipse = Buffer.from(`<svg viewBox="0 0 ${width} ${height}"> <ellipse cx="${leftOffset}" cy="${topOffset}" rx="${radiusX}" ry="${radiusY}" /></svg>`);
                const overlayOptions = [{ input: ellipse, blend: "dest-in" }];
                // Need to break out into another sharp pipeline to allow for resize after composite
                const data = yield originalImage.composite(overlayOptions).toBuffer();
                return (0, sharp_1.default)(data).withMetadata().trim();
            }
            return originalImage;
        });
    }
    /**
     * Blurs the image provided if there is inappropriate content
     * @param originalImage the original image
     * @param blur the amount to blur
     * @param moderationLabels the labels identifying specific content to blur
     * @param foundContentLabels the labels identifying inappropriate content found
     */
    blurImage(originalImage, blur, moderationLabels, foundContentLabels) {
        const blurValue = blur !== undefined ? Math.ceil(blur) : 50;
        if (blurValue >= 0.3 && blurValue <= 1000) {
            if (moderationLabels) {
                for (const moderationLabel of foundContentLabels.ModerationLabels) {
                    if (moderationLabels.includes(moderationLabel.Name)) {
                        originalImage.blur(blurValue);
                        break;
                    }
                }
            }
            else if (foundContentLabels.ModerationLabels.length) {
                originalImage.blur(blurValue);
            }
        }
    }
    /**
     *
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     */
    applyContentModeration(originalImage, edits) {
        return __awaiter(this, void 0, void 0, function* () {
            // content moderation can be boolean or object
            if (edits.contentModeration === true || typeof edits.contentModeration === "object") {
                const { minConfidence, blur, moderationLabels } = typeof edits.contentModeration === "object"
                    ? edits.contentModeration
                    : {
                        minConfidence: undefined,
                        blur: undefined,
                        moderationLabels: undefined,
                    };
                const { imageBuffer, format } = yield this.getRekognitionCompatibleImage(originalImage);
                const inappropriateContent = yield this.detectInappropriateContent(imageBuffer.data, minConfidence);
                this.blurImage(originalImage, blur, moderationLabels, inappropriateContent);
                // convert image back to previous format
                if (format !== imageBuffer.info.format) {
                    originalImage.toFormat(format);
                }
            }
        });
    }
    /**
     * Applies crop edit.
     * @param originalImage The original sharp image.
     * @param edits The edits to be made to the original image.
     */
    applyCrop(originalImage, edits) {
        try {
            originalImage.extract(edits.crop);
        }
        catch (error) {
            throw new lib_1.ImageHandlerError(lib_1.StatusCodes.BAD_REQUEST, "Crop::AreaOutOfBounds", "The cropping area you provided exceeds the boundaries of the original image. Please try choosing a correct cropping value.");
        }
    }
    /**
     * Checks whether an edit needs to be skipped or not.
     * @param edit the current edit.
     * @param isAnimation a flag whether the edit applies to `gif` file or not.
     * @returns whether the edit needs to be skipped or not.
     */
    skipEdit(edit, isAnimation) {
        return isAnimation && ["rotate", "smartCrop", "roundCrop", "contentModeration"].includes(edit);
    }
    /**
     * Gets an image to be used as an overlay to the primary image from an Amazon S3 bucket.
     * @param bucket The name of the bucket containing the overlay.
     * @param key The object keyname corresponding to the overlay.
     * @param wRatio The width rate of the overlay image.
     * @param hRatio The height rate of the overlay image.
     * @param alpha The transparency alpha to the overlay.
     * @param sourceImageMetadata The metadata of the source image.
     * @returns An image to be used as an overlay.
     */
    getOverlayImage(bucket, key, wRatio, hRatio, alpha, sourceImageMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { Bucket: bucket, Key: key };
            try {
                const { width, height } = sourceImageMetadata;
                const overlayImage = yield this.s3Client.getObject(params).promise();
                const resizeOptions = {
                    fit: lib_1.ImageFitTypes.INSIDE,
                };
                // Set width and height of the watermark image based on the ratio
                const zeroToHundred = /^(100|[1-9]?\d)$/;
                if (zeroToHundred.test(wRatio)) {
                    resizeOptions.width = Math.floor((width * parseInt(wRatio)) / 100);
                }
                if (zeroToHundred.test(hRatio)) {
                    resizeOptions.height = Math.floor((height * parseInt(hRatio)) / 100);
                }
                // If alpha is not within 0-100, the default alpha is 0 (fully opaque).
                const alphaValue = zeroToHundred.test(alpha) ? parseInt(alpha) : 0;
                const imageBuffer = Buffer.isBuffer(overlayImage.Body)
                    ? overlayImage.Body
                    : Buffer.from(overlayImage.Body);
                return yield (0, sharp_1.default)(imageBuffer)
                    .resize(resizeOptions)
                    .composite([
                    {
                        input: Buffer.from([255, 255, 255, 255 * (1 - alphaValue / 100)]),
                        raw: { width: 1, height: 1, channels: 4 },
                        tile: true,
                        blend: "dest-in",
                    },
                ])
                    .toBuffer();
            }
            catch (error) {
                throw new lib_1.ImageHandlerError(error.statusCode ? error.statusCode : lib_1.StatusCodes.INTERNAL_SERVER_ERROR, error.code, error.message);
            }
        });
    }
    /**
     * Calculates the crop area for a smart-cropped image based on the bounding box data returned by Amazon Rekognition, as well as padding options and the image metadata.
     * @param boundingBox The bounding box of the detected face.
     * @param padding Set of options for smart cropping.
     * @param boxSize Sharp image metadata.
     * @returns Calculated crop area for a smart-cropped image.
     */
    getCropArea(boundingBox, padding, boxSize) {
        // calculate needed options dimensions
        let left = Math.floor(boundingBox.left * boxSize.width - padding);
        let top = Math.floor(boundingBox.top * boxSize.height - padding);
        let extractWidth = Math.floor(boundingBox.width * boxSize.width + padding * 2);
        let extractHeight = Math.floor(boundingBox.height * boxSize.height + padding * 2);
        // check if dimensions fit within image dimensions and re-adjust if necessary
        left = left < 0 ? 0 : left;
        top = top < 0 ? 0 : top;
        const maxWidth = boxSize.width - left;
        const maxHeight = boxSize.height - top;
        extractWidth = extractWidth > maxWidth ? maxWidth : extractWidth;
        extractHeight = extractHeight > maxHeight ? maxHeight : extractHeight;
        // Calculate the smart crop area
        return {
            left,
            top,
            width: extractWidth,
            height: extractHeight,
        };
    }
    /**
     *
     * @param response the response from a Rekognition detectFaces API call
     * @param faceIndex the index number of the face detected
     * @param boundingBox the box bounds
     * @param boundingBox.Height height of bounding box
     * @param boundingBox.Left left side of bounding box
     * @param boundingBox.Top top of bounding box
     * @param boundingBox.Width width of bounding box
     */
    handleBounds(response, faceIndex, boundingBox) {
        // handle bounds > 1 and < 0
        for (const bound in response.FaceDetails[faceIndex].BoundingBox) {
            if (response.FaceDetails[faceIndex].BoundingBox[bound] < 0)
                boundingBox[bound] = 0;
            else if (response.FaceDetails[faceIndex].BoundingBox[bound] > 1)
                boundingBox[bound] = 1;
            else
                boundingBox[bound] = response.FaceDetails[faceIndex].BoundingBox[bound];
        }
        // handle bounds greater than the size of the image
        if (boundingBox.Left + boundingBox.Width > 1) {
            boundingBox.Width = 1 - boundingBox.Left;
        }
        if (boundingBox.Top + boundingBox.Height > 1) {
            boundingBox.Height = 1 - boundingBox.Top;
        }
    }
    /**
     * Gets the bounding box of the specified face index within an image, if specified.
     * @param imageBuffer The original image.
     * @param faceIndex The zero-based face index value, moving from 0 and up as confidence decreases for detected faces within the image.
     * @returns The bounding box of the specified face index within an image.
     */
    getBoundingBox(imageBuffer, faceIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = { Image: { Bytes: imageBuffer } };
            try {
                const response = yield this.rekognitionClient.detectFaces(params).promise();
                if (response.FaceDetails.length <= 0) {
                    return { height: 1, left: 0, top: 0, width: 1 };
                }
                const boundingBox = {};
                this.handleBounds(response, faceIndex, boundingBox);
                return {
                    height: boundingBox.Height,
                    left: boundingBox.Left,
                    top: boundingBox.Top,
                    width: boundingBox.Width,
                };
            }
            catch (error) {
                console.error(error);
                if (error.message === "Cannot read property 'BoundingBox' of undefined" ||
                    error.message === "Cannot read properties of undefined (reading 'BoundingBox')") {
                    throw new lib_1.ImageHandlerError(lib_1.StatusCodes.BAD_REQUEST, "SmartCrop::FaceIndexOutOfRange", "You have provided a FaceIndex value that exceeds the length of the zero-based detectedFaces array. Please specify a value that is in-range.");
                }
                else {
                    throw new lib_1.ImageHandlerError(error.statusCode ? error.statusCode : lib_1.StatusCodes.INTERNAL_SERVER_ERROR, error.code, error.message);
                }
            }
        });
    }
    /**
     * Detects inappropriate content in an image.
     * @param imageBuffer The original image.
     * @param minConfidence The options to pass to the detectModerationLabels Rekognition function.
     * @returns Detected inappropriate content in an image.
     */
    detectInappropriateContent(imageBuffer, minConfidence) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    Image: { Bytes: imageBuffer },
                    MinConfidence: minConfidence !== null && minConfidence !== void 0 ? minConfidence : 75,
                };
                return yield this.rekognitionClient.detectModerationLabels(params).promise();
            }
            catch (error) {
                console.error(error);
                throw new lib_1.ImageHandlerError(error.statusCode ? error.statusCode : lib_1.StatusCodes.INTERNAL_SERVER_ERROR, error.code, error.message);
            }
        });
    }
    /**
     * Converts serverless image handler image format type to 'sharp' format.
     * @param imageFormatType Result output file type.
     * @returns Converted 'sharp' format.
     */
    static convertImageFormatType(imageFormatType) {
        switch (imageFormatType) {
            case lib_1.ImageFormatTypes.JPG:
                return "jpg";
            case lib_1.ImageFormatTypes.JPEG:
                return "jpeg";
            case lib_1.ImageFormatTypes.PNG:
                return "png";
            case lib_1.ImageFormatTypes.WEBP:
                return "webp";
            case lib_1.ImageFormatTypes.TIFF:
                return "tiff";
            case lib_1.ImageFormatTypes.HEIF:
                return "heif";
            case lib_1.ImageFormatTypes.RAW:
                return "raw";
            case lib_1.ImageFormatTypes.GIF:
                return "gif";
            default:
                throw new lib_1.ImageHandlerError(lib_1.StatusCodes.INTERNAL_SERVER_ERROR, "UnsupportedOutputImageFormatException", `Format to ${imageFormatType} not supported`);
        }
    }
    /**
     * Converts the image to a rekognition compatible format if current format is not compatible.
     * @param image the image to be modified by rekognition.
     * @returns object containing image buffer data and original image format.
     */
    getRekognitionCompatibleImage(image) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield image.metadata();
            const format = metadata.format;
            let imageBuffer;
            // convert image to png if not jpeg or png
            if (!["jpeg", "png"].includes(format)) {
                imageBuffer = yield image.png().toBuffer({ resolveWithObject: true });
            }
            else {
                imageBuffer = yield image.toBuffer({ resolveWithObject: true });
            }
            return { imageBuffer, format };
        });
    }
}
exports.ImageHandler = ImageHandler;
//# sourceMappingURL=image-handler.js.map