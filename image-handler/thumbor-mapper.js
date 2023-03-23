"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThumborMapper = void 0;
const color_1 = __importDefault(require("color"));
const color_name_1 = __importDefault(require("color-name"));
const lib_1 = require("./lib");
class ThumborMapper {
    /**
     * Initializer function for creating a new Thumbor mapping, used by the image
     * handler to perform image modifications based on legacy URL path requests.
     * @param path The request path.
     * @returns Image edits based on the request path.
     */
    mapPathToEdits(path) {
        var _a, _b;
        const fileFormat = path.substring(path.lastIndexOf(".") + 1);
        let edits = this.mergeEdits(this.mapCrop(path), this.mapResize(path), this.mapFitIn(path));
        // parse the image path. we have to sort here to make sure that when we have a file name without extension,
        // and `format` and `quality` filters are passed, then the `format` filter will go first to be able
        // to apply the `quality` filter to the target image format.
        const filters = (_b = (_a = path
            .match(/filters:[^)]+/g)) === null || _a === void 0 ? void 0 : _a.map((filter) => `${filter})`).sort()) !== null && _b !== void 0 ? _b : [];
        for (const filter of filters) {
            edits = this.mapFilter(filter, fileFormat, edits);
        }
        return edits;
    }
    /**
     * Enables users to migrate their current image request model to the SIH solution,
     * without changing their legacy application code to accommodate new image requests.
     * @param path The URL path extracted from the web request.
     * @returns The parsed path using the match pattern and the substitution.
     */
    parseCustomPath(path) {
        // Perform the substitution and return
        const { REWRITE_MATCH_PATTERN, REWRITE_SUBSTITUTION } = process.env;
        if (path === undefined) {
            throw new Error("ThumborMapping::ParseCustomPath::PathUndefined");
        }
        else if (REWRITE_MATCH_PATTERN === undefined) {
            throw new Error("ThumborMapping::ParseCustomPath::RewriteMatchPatternUndefined");
        }
        else if (REWRITE_SUBSTITUTION === undefined) {
            throw new Error("ThumborMapping::ParseCustomPath::RewriteSubstitutionUndefined");
        }
        else {
            let parsedPath = "";
            if (typeof REWRITE_MATCH_PATTERN === "string") {
                const patternStrings = REWRITE_MATCH_PATTERN.split("/");
                const flags = patternStrings.pop();
                const parsedPatternString = REWRITE_MATCH_PATTERN.slice(1, REWRITE_MATCH_PATTERN.length - 1 - flags.length);
                const regExp = new RegExp(parsedPatternString, flags);
                parsedPath = path.replace(regExp, REWRITE_SUBSTITUTION);
            }
            else {
                parsedPath = path.replace(REWRITE_MATCH_PATTERN, REWRITE_SUBSTITUTION);
            }
            return parsedPath;
        }
    }
    /**
     * Maps background color the current edits object
     * @param filterValue The specified color value
     * @param currentEdits The edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapBGColor(filterValue, currentEdits) {
        const color = !color_name_1.default[filterValue] ? `#${filterValue}` : filterValue;
        currentEdits.flatten = { background: (0, color_1.default)(color).object() };
    }
    /**
     * Maps blur to current edits object
     * @param filterValue The blur value provided
     * @param currentEdits The edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapBlur(filterValue, currentEdits) {
        const [radius, sigma] = filterValue.split(",").map((x) => (x === "" ? NaN : Number(x)));
        currentEdits.blur = !isNaN(sigma) ? sigma : radius / 2;
    }
    /**
     * Maps convolution to current edits object
     * @param filterValue the convolution value provided
     * @param currentEdits the edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapConvolution(filterValue, currentEdits) {
        const values = filterValue.split(",");
        const matrix = values[0].split(";").map((str) => Number(str));
        const matrixWidth = Number(values[1]);
        const matrixHeight = Math.ceil(matrix.length / matrixWidth);
        currentEdits.convolve = {
            width: matrixWidth,
            height: matrixHeight,
            kernel: matrix,
        };
    }
    /**
     * Maps fill to the current edits object
     * @param filterValue The fill value provided
     * @param currentEdits The edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapFill(filterValue, currentEdits) {
        if (currentEdits.resize === undefined) {
            currentEdits.resize = {};
        }
        let color = filterValue;
        if (!color_name_1.default[color]) {
            color = `#${color}`;
        }
        currentEdits.resize.fit = lib_1.ImageFitTypes.CONTAIN;
        currentEdits.resize.background = (0, color_1.default)(color).object();
    }
    /**
     * Maps the output format to the current edits object
     * @param filterValue The output format
     * @param currentEdits The edits to be provided
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapFormat(filterValue, currentEdits) {
        const imageFormatType = filterValue.replace(/[^0-9a-z]/gi, "").replace(/jpg/i, "jpeg");
        const acceptedValues = [
            lib_1.ImageFormatTypes.HEIC,
            lib_1.ImageFormatTypes.HEIF,
            lib_1.ImageFormatTypes.JPEG,
            lib_1.ImageFormatTypes.PNG,
            lib_1.ImageFormatTypes.RAW,
            lib_1.ImageFormatTypes.TIFF,
            lib_1.ImageFormatTypes.WEBP,
            lib_1.ImageFormatTypes.GIF,
        ];
        if (acceptedValues.includes(imageFormatType)) {
            currentEdits.toFormat = imageFormatType;
        }
    }
    /**
     * Adds withoutEnlargement option to resize in currentEdits object
     * @param currentEdits The edits to be perforemd
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapNoUpscale(currentEdits) {
        if (currentEdits.resize === undefined) {
            currentEdits.resize = {};
        }
        currentEdits.resize.withoutEnlargement = true;
    }
    /**
     * Maps resize ratios to the current edits object
     * @param filterValue The ratio value
     * @param currentEdits The edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapResizeRatio(filterValue, currentEdits) {
        if (currentEdits.resize === undefined) {
            currentEdits.resize = {};
        }
        const ratio = Number(filterValue);
        if (currentEdits.resize.width && currentEdits.resize.height) {
            currentEdits.resize.width = Number(currentEdits.resize.width * ratio);
            currentEdits.resize.height = Number(currentEdits.resize.height * ratio);
        }
        else {
            currentEdits.resize.ratio = Number(filterValue);
        }
    }
    /**
     * Maps the quality value of the output format to the current edits
     * @param filterValue The quality value provided
     * @param currentEdits The edits to be performed
     * @param fileFormat The image format
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapQuality(filterValue, currentEdits, fileFormat) {
        var _a;
        const toSupportedImageFormatType = (format) => {
            if ([lib_1.ImageFormatTypes.JPG, lib_1.ImageFormatTypes.JPEG].includes(format)) {
                return lib_1.ImageFormatTypes.JPEG;
            }
            else if ([
                lib_1.ImageFormatTypes.PNG,
                lib_1.ImageFormatTypes.WEBP,
                lib_1.ImageFormatTypes.TIFF,
                lib_1.ImageFormatTypes.HEIF,
                lib_1.ImageFormatTypes.GIF,
            ].includes(format)) {
                return format;
            }
        };
        // trying to get a target image type base on `fileFormat` passed to the current method.
        // if we cannot get the target format, then trying to get the target format from `format` filter.
        const targetImageFileFormat = (_a = toSupportedImageFormatType(fileFormat)) !== null && _a !== void 0 ? _a : toSupportedImageFormatType(currentEdits.toFormat);
        if (targetImageFileFormat) {
            currentEdits[targetImageFileFormat] = { quality: Number(filterValue) };
        }
    }
    /**
     * Maps stretch fit to the current edits
     * @param currentEdits The edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapStretch(currentEdits) {
        if (currentEdits.resize === undefined) {
            currentEdits.resize = {};
        }
        // If fit-in is not defined, fit parameter would be 'fill'.
        if (currentEdits.resize.fit !== lib_1.ImageFitTypes.INSIDE) {
            currentEdits.resize.fit = lib_1.ImageFitTypes.FILL;
        }
    }
    /**
     * Maps upscale fit to the current edits
     * @param currentEdits The edits to be performed
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapUpscale(currentEdits) {
        if (currentEdits.resize === undefined) {
            currentEdits.resize = {};
        }
        currentEdits.resize.fit = lib_1.ImageFitTypes.INSIDE;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapWatermark(filterValue, currentEdits) {
        const options = filterValue.replace(/\s+/g, "").split(",");
        const [bucket, key, xPos, yPos, alpha, wRatio, hRatio] = options;
        currentEdits.overlayWith = {
            bucket,
            key,
            alpha,
            wRatio,
            hRatio,
            options: {},
        };
        const allowedPosPattern = /^(100|[1-9]?\d|-(100|[1-9]\d?))p$/;
        if (allowedPosPattern.test(xPos) || !isNaN(Number(xPos))) {
            currentEdits.overlayWith.options.left = xPos;
        }
        if (allowedPosPattern.test(yPos) || !isNaN(Number(yPos))) {
            currentEdits.overlayWith.options.top = yPos;
        }
    }
    /**
     * Scanner function for matching supported Thumbor filters and converting their capabilities into sharp.js supported operations.
     * @param filterExpression The URL path filter.
     * @param fileFormat The file type of the original image.
     * @param previousEdits Cumulative edit, to take into account the previous filters, i.g. `stretch` uses `resize.fit` to make a right update.
     * @returns Cumulative edits based on the previous edits and the current filter.
     */
    mapFilter(filterExpression, fileFormat, previousEdits = {}) {
        const matched = filterExpression.match(/:(.+)\((.*)\)/);
        const [_, filterName, filterValue] = matched;
        const currentEdits = Object.assign({}, previousEdits);
        // Find the proper filter
        switch (filterName) {
            case "autojpg": {
                currentEdits.toFormat = lib_1.ImageFormatTypes.JPEG;
                break;
            }
            case "background_color": {
                this.mapBGColor(filterValue, currentEdits);
                break;
            }
            case "blur": {
                this.mapBlur(filterValue, currentEdits);
                break;
            }
            case "convolution": {
                this.mapConvolution(filterValue, currentEdits);
                break;
            }
            case "equalize": {
                currentEdits.normalize = true;
                break;
            }
            case "fill": {
                this.mapFill(filterValue, currentEdits);
                break;
            }
            case "format": {
                this.mapFormat(filterValue, currentEdits);
                break;
            }
            case "grayscale": {
                currentEdits.grayscale = true;
                break;
            }
            case "no_upscale": {
                this.mapNoUpscale(currentEdits);
                break;
            }
            case "proportion": {
                this.mapResizeRatio(filterValue, currentEdits);
                break;
            }
            case "quality": {
                this.mapQuality(filterValue, currentEdits, fileFormat);
                break;
            }
            case "rgb": {
                const percentages = filterValue.split(",");
                const values = percentages.map((percentage) => 255 * (Number(percentage) / 100));
                const [r, g, b] = values;
                currentEdits.tint = { r, g, b };
                break;
            }
            case "rotate": {
                currentEdits.rotate = Number(filterValue);
                break;
            }
            case "sharpen": {
                const values = filterValue.split(",");
                currentEdits.sharpen = 1 + Number(values[1]) / 2;
                break;
            }
            case "stretch": {
                this.mapStretch(currentEdits);
                break;
            }
            case "strip_exif":
            case "strip_icc": {
                currentEdits.rotate = null;
                break;
            }
            case "upscale": {
                this.mapUpscale(currentEdits);
                break;
            }
            case "watermark": {
                this.mapWatermark(filterValue, currentEdits);
                break;
            }
        }
        return currentEdits;
    }
    /**
     * Maps the image path to crop image edit.
     * @param path an image path.
     * @returns image edits associated with crop.
     */
    mapCrop(path) {
        const pathCropMatchResult = path.match(/\d{1,6}x\d{1,6}:\d{1,6}x\d{1,6}/g);
        if (pathCropMatchResult) {
            const [leftTopPoint, rightBottomPoint] = pathCropMatchResult[0].split(":");
            const [leftTopX, leftTopY] = leftTopPoint.split("x").map((x) => parseInt(x, 10));
            const [rightBottomX, rightBottomY] = rightBottomPoint.split("x").map((x) => parseInt(x, 10));
            if (!isNaN(leftTopX) && !isNaN(leftTopY) && !isNaN(rightBottomX) && !isNaN(rightBottomY)) {
                const cropEdit = {
                    crop: {
                        left: leftTopX,
                        top: leftTopY,
                        width: rightBottomX - leftTopX,
                        height: rightBottomY - leftTopY,
                    },
                };
                return cropEdit;
            }
        }
        return ThumborMapper.EMPTY_IMAGE_EDITS;
    }
    /**
     * Maps the image path to resize image edit.
     * @param path An image path.
     * @returns Image edits associated with resize.
     */
    mapResize(path) {
        // Process the dimensions
        const dimensionsMatchResult = path.match(/\/((\d+x\d+)|(0x\d+))\//g);
        if (dimensionsMatchResult) {
            // Assign dimensions from the first match only to avoid parsing dimension from image file names
            const [width, height] = dimensionsMatchResult[0]
                .replace(/\//g, "")
                .split("x")
                .map((x) => parseInt(x));
            // Set only if the dimensions provided are valid
            if (!isNaN(width) && !isNaN(height)) {
                const resizeEdit = { resize: {} };
                // If width or height is 0, fit would be inside.
                if (width === 0 || height === 0) {
                    resizeEdit.resize.fit = lib_1.ImageFitTypes.INSIDE;
                }
                resizeEdit.resize.width = width === 0 ? null : width;
                resizeEdit.resize.height = height === 0 ? null : height;
                return resizeEdit;
            }
        }
        return ThumborMapper.EMPTY_IMAGE_EDITS;
    }
    /**
     * Maps the image path to fit image edit.
     * @param path An image path.
     * @returns Image edits associated with fit-in filter.
     */
    mapFitIn(path) {
        return path.includes("fit-in") ? { resize: { fit: lib_1.ImageFitTypes.INSIDE } } : ThumborMapper.EMPTY_IMAGE_EDITS;
    }
    /**
     * A helper method to merge edits.
     * @param edits Edits to merge.
     * @returns Merged edits.
     */
    mergeEdits(...edits) {
        return edits.reduce((result, current) => {
            Object.keys(current).forEach((key) => {
                if (Array.isArray(result[key]) && Array.isArray(current[key])) {
                    result[key] = Array.from(new Set(result[key].concat(current[key])));
                }
                else if (this.isObject(result[key]) && this.isObject(current[key])) {
                    result[key] = this.mergeEdits(result[key], current[key]);
                }
                else {
                    result[key] = current[key];
                }
            });
            return result;
        }, {});
    }
    /**
     * A helper method to check whether a passed argument is object or not.
     * @param obj Object to check.
     * @returns Whether or not a passed argument is object.
     */
    isObject(obj) {
        return obj && typeof obj === "object" && !Array.isArray(obj);
    }
}
exports.ThumborMapper = ThumborMapper;
ThumborMapper.EMPTY_IMAGE_EDITS = {};
//# sourceMappingURL=thumbor-mapper.js.map