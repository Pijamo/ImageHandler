"use strict";
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentTypes = exports.ImageFitTypes = exports.ImageFormatTypes = exports.RequestTypes = exports.StatusCodes = void 0;
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["OK"] = 200] = "OK";
    StatusCodes[StatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCodes[StatusCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    StatusCodes[StatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCodes[StatusCodes["REQUEST_TOO_LONG"] = 413] = "REQUEST_TOO_LONG";
    StatusCodes[StatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(StatusCodes = exports.StatusCodes || (exports.StatusCodes = {}));
var RequestTypes;
(function (RequestTypes) {
    RequestTypes["DEFAULT"] = "Default";
    RequestTypes["CUSTOM"] = "Custom";
    RequestTypes["THUMBOR"] = "Thumbor";
})(RequestTypes = exports.RequestTypes || (exports.RequestTypes = {}));
var ImageFormatTypes;
(function (ImageFormatTypes) {
    ImageFormatTypes["JPG"] = "jpg";
    ImageFormatTypes["JPEG"] = "jpeg";
    ImageFormatTypes["PNG"] = "png";
    ImageFormatTypes["WEBP"] = "webp";
    ImageFormatTypes["TIFF"] = "tiff";
    ImageFormatTypes["HEIF"] = "heif";
    ImageFormatTypes["HEIC"] = "heic";
    ImageFormatTypes["RAW"] = "raw";
    ImageFormatTypes["GIF"] = "gif";
})(ImageFormatTypes = exports.ImageFormatTypes || (exports.ImageFormatTypes = {}));
var ImageFitTypes;
(function (ImageFitTypes) {
    ImageFitTypes["COVER"] = "cover";
    ImageFitTypes["CONTAIN"] = "contain";
    ImageFitTypes["FILL"] = "fill";
    ImageFitTypes["INSIDE"] = "inside";
    ImageFitTypes["OUTSIDE"] = "outside";
})(ImageFitTypes = exports.ImageFitTypes || (exports.ImageFitTypes = {}));
var ContentTypes;
(function (ContentTypes) {
    ContentTypes["PNG"] = "image/png";
    ContentTypes["JPEG"] = "image/jpeg";
    ContentTypes["WEBP"] = "image/webp";
    ContentTypes["TIFF"] = "image/tiff";
    ContentTypes["GIF"] = "image/gif";
    ContentTypes["SVG"] = "image/svg+xml";
})(ContentTypes = exports.ContentTypes || (exports.ContentTypes = {}));
//# sourceMappingURL=enums.js.map