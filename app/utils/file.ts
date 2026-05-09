import { CACHE_URL_PREFIX } from "../constant";
import { useUserState } from "../store/user";
import { sys } from "./sys";
import Locale from "../locales";
import { OpenAPI } from "../openapi";
import { MultimodalContent } from "../types";

function compressImage(file: Blob, maxSize: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent: any) => {
            const image = new Image();
            image.onload = () => {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                let width = image.width;
                let height = image.height;
                let quality = 0.9;
                let dataUrl;

                do {
                    canvas.width = width;
                    canvas.height = height;
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    ctx?.drawImage(image, 0, 0, width, height);
                    dataUrl = canvas.toDataURL("image/jpeg", quality);

                    if (dataUrl.length < maxSize) break;

                    if (quality > 0.5) {
                        // Prioritize quality reduction
                        quality -= 0.1;
                    } else {
                        // Then reduce the size
                        width *= 0.9;
                        height *= 0.9;
                    }
                } while (dataUrl.length > maxSize);

                resolve(dataUrl);
            };
            image.onerror = reject;
            image.src = readerEvent.target.result;
        };
        reader.onerror = reject;

        if (file.type.includes("heic")) {
            try {
                const heic2any = require("heic2any");
                heic2any({ blob: file, toType: "image/jpeg" })
                    .then((blob: Blob) => {
                        reader.readAsDataURL(blob);
                    })
                    .catch((e: any) => {
                        reject(e);
                    });
            } catch (e) {
                reject(e);
            }
        }

        reader.readAsDataURL(file);
    });
}

async function preProcessImageContent(
    content: string | MultimodalContent[],
) {
    if (typeof content === "string") {
        return content;
    }
    const result = [];
    for (const part of content) {
        if (part?.type == "file" && part?.url) {
            try {
                const url = await cacheImageToBase64Image(part?.url);
                result.push({ type: part.type, url: url });
            } catch (error) {
                sys.log.error("Error processing image URL:", error);
            }
        } else {
            result.push({ ...part });
        }
    }
    return result;
}

const imageCaches: Record<string, string> = {};

function cacheImageToBase64Image(imageUrl: string) {
    if (imageUrl.includes(CACHE_URL_PREFIX)) {
        if (!imageCaches[imageUrl]) {
            const reader = new FileReader();
            return fetch(imageUrl, {
                method: "GET",
                mode: "cors",
                credentials: "include",
            })
                .then((res) => res.blob())
                .then(
                    async (blob) =>
                        (imageCaches[imageUrl] = await compressImage(blob, 256 * 1024)),
                ); // compressImage
        }
        return Promise.resolve(imageCaches[imageUrl]);
    }
    return Promise.resolve(imageUrl);
}

function base64String2Blob(base64Data: string, contentType: string): Blob {
    //此处的base64Data不包含data:image/png;base64等前缀，如果有需要先去掉再调用此函数
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}

function base64Data2Blob(base64Data: string): Blob {
    // base64Data包含data:image/png;base64等前缀，需要解析出其中的base64字符串和contentType
    const byteString = window.atob(base64Data.split(',')[1]);
    const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], {
        type: mimeString
    });
    return blob;
}

async function uploadFile(file: Blob | File, fileName?: string): Promise<any> {
    let filename = (file as File)?.name;
    if (fileName)
        filename = fileName;

    sys.log.info("上传文件>>>待上传的文件名称和大小:", filename, (file.size / 1024).toFixed(1) + "KB");

    const filePath = useUserState.getState().userId + "/" + renameFileName(filename);

    return OpenAPI.ossGetSTS(filePath)
        .then((result) => {
            // 获取上传签名
            if (!result.success || result.result == null) {
                sys.log.error("上传文件>>>获取上传签名错误:", result);
                sys.msg.error(result.message);
                return;
            }

            const data = result.result;

            sys.log.info("上传文件>>>获取签名:",data);

            let formData = new FormData();
            formData.append("success_action_status", "200");
            formData.append("policy", data.policy);
            formData.append("x-oss-signature", data.signature);
            formData.append("x-oss-signature-version", "OSS4-HMAC-SHA256");
            formData.append("x-oss-credential", data.x_oss_credential);
            formData.append("x-oss-date", data.x_oss_date);
            formData.append("key", filePath); // 文件名
            formData.append("x-oss-security-token", data.security_token);
            formData.append("file", file); // file 必须为最后一个表单域

            return fetch(data.host, {
                method: "POST",
                body: formData
            });
        })
        .then((response) => {
            const rid=response?.headers.get("RequesID");
            if (!response?.ok) {
                debugger;
                sys.log.error("上传文件>>>文件上传错误:", response?.statusText,rid);
                throw new Error(Locale.Common.UploadFailed + JSON.stringify(response));
            }

            return OpenAPI.ossGetUrl(filePath);
        })
        .then(async (result) => {
            if (!result.success) {
                sys.log.error("上传文件>>>获取文件访问地址错误:", result);
                throw new Error(result.message);
            }

            return result.result;
        })
        .catch((error) => {
            sys.log.info("上传文件>>>未知错误:", error);
        });
}

async function uploadBase64Data(base64Data: string, fileName?: string) {
    if (!fileName) {
        const matches = base64Data.match(/^data:(.+);base64,/);
        const contentType = matches ? matches[1] : "application/octet-stream";
        const extension = contentType.split('/')[1] || 'bin';
        fileName = `${Date.now()}.${extension}`;
    }

    const filePath = useUserState.getState().userId + "/" + renameFileName(fileName);

    return OpenAPI.ossGetSTS(filePath)
        .then((result) => {
            // 获取上传签名
            if (!result.success || result.result == null) {
                sys.log.error("sts>>>获取上传签名错误:", result);
                sys.msg.error(result.message);
                throw new Error("获取上传签名失败");
            }

            const blob = base64Data2Blob(base64Data);

            const data = result.result;

            let formData = new FormData();
            formData.append("success_action_status", "200");
            formData.append("policy", data.policy);
            formData.append("x-oss-signature", data.signature);
            formData.append("x-oss-signature-version", "OSS4-HMAC-SHA256");
            formData.append("x-oss-credential", data.x_oss_credential);
            formData.append("x-oss-date", data.x_oss_date);
            formData.append("key", filePath); // 文件名
            formData.append("x-oss-security-token", data.security_token);
            formData.append("file", blob); // file 必须为最后一个表单域

            sys.log.info("sts>>>上传文件:", formData);

            return fetch(data.host, {
                method: "POST",
                body: formData
            });


        })
        .then((response) => {
            if (!response?.ok) {
                sys.log.error("sts>>>文件上传错误:", response);
                sys.msg.error("上传失败：" + response?.text);

                throw new Error("文件上传失败：" + JSON.stringify(response));
            }

            return OpenAPI.ossGetUrl(filePath);
        })
        .then(async (result) => {
            if (result?.success) {
                return result.result;
            }
            else {
                sys.log.error("sts>>>获取文件访问地址错误:", result);
                sys.msg.error("获取访问地址失败：" + result?.message);
                throw new Error(result?.message || "获取文件访问地址失败");
            }
        })
        .catch((error) => {
            sys.log.error("sts>>>上传文件异常:", error);
            sys.msg.error("上传异常：" + error);
            throw error;
        });
}

export enum UploadFormat {
    Image = "image",
    Video = "video",
    Doc = "doc",
    Audio = "audio"
};
export const UploadImageFormat = "image/png, image/jpeg,image/jpg, image/webp,";
export const ImageFormat = ['jpg', 'jpeg', 'png', 'webp'];
export const UploadVideoFormat = "video/mp4, video/wmv, video/avi, video/mov,";
export const VideoFormat = ['mp4', 'wmv', 'avi', 'mov'];
export const UploadAudioFormat = "audio/flac, audio/mp3, audio/wav,";
export const AudioFormat = ['mp3', 'flac', 'wav'];
export const UploadDocFormat = "application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" +
    ",application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" +
    ",application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation" +
    ",application/pdf,text/plain,";
export function getUploadAccept(format: UploadFormat | undefined) {
    switch (format) {
        case UploadFormat.Image:
            return UploadImageFormat;
        case UploadFormat.Video:
            return UploadVideoFormat;
        case UploadFormat.Audio:
            return UploadAudioFormat;
        case UploadFormat.Doc:
            return UploadDocFormat;
        default:
            return UploadImageFormat + UploadVideoFormat + UploadAudioFormat + UploadDocFormat;
    }
}

async function uploadFiles(props: {
    onCompleted: (files: Record<string, string>[]) => void,
    maxCount?: number,
    maxSize?: number;
    format?: UploadFormat,
    onUploading?: () => void,
    onError?: (file: Record<string, string>) => void,
    onUploaded?: (file: Record<string, string>) => void
}) {
    await new Promise<Record<string, string>[]>((res, rej) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = getUploadAccept(props.format);
        fileInput.multiple = true;
        fileInput.onchange = (event: any) => {
            if (props.onUploading)
                props.onUploading();

            const files = event.target.files;
            const successFiles: Record<string, string>[] = [];
            const errorFiles: Record<string, string>[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = event.target.files[i];

                if (props.maxSize && file.size > props.maxSize) {
                    sys.log.error(">>>uploadFiles error: 文件大小超出限制");
                    sys.msg.error(Locale.Common.UploadFailedOnSize);
                    errorFiles.push({ name: (file as File)?.name, url: "" });
                    props.onError?.({ name: (file as File)?.name, url: "" });
                    continue;
                }

                uploadFile(file)
                    .then((fileUrl) => {
                        const uploadFile = ({ name: (file as File)?.name, url: fileUrl });

                        if (fileUrl) {
                            successFiles.push(uploadFile);
                        }
                        else {
                            errorFiles.push(uploadFile);
                            props.onError?.(uploadFile);
                        }

                        props.onUploaded?.(uploadFile);

                        if (
                            successFiles.length >= (props.maxCount ?? 1) ||
                            (successFiles.length + errorFiles.length) === files.length
                        ) {
                            props.onCompleted(successFiles);
                            res(successFiles);
                        }
                    })
                    .catch((e) => {
                        sys.log.error(">>>uploadFiles error:", JSON.stringify(e));
                        sys.msg.error(Locale.Common.UploadFailed);

                        errorFiles.push({ name: (file as File)?.name, url: "" });
                        props.onError?.({ name: (file as File)?.name, url: "" });

                        if (
                            successFiles.length >= (props.maxCount ?? 1) ||
                            (successFiles.length + errorFiles.length) === files.length
                        ) {
                            props.onCompleted(successFiles);
                            res(successFiles);
                        }
                    });
            }
        };

        fileInput.click();
    });
}

function removeImage(imageUrl: string) {
    return fetch(imageUrl, {
        method: "DELETE",
        mode: "cors",
        credentials: "include",
    });
}

function isImage(filePath: string) {
    const fileName = getName(filePath);
    const fileExtension = (fileName.split('.').pop() || '').toLowerCase();
    return ImageFormat.includes(fileExtension);
}

function isVideo(filePath: string) {
    const fileName = getName(filePath);
    const fileExtension = (fileName.split('.').pop() || '').toLowerCase();
    return VideoFormat.includes(fileExtension);
}

function isAudio(filePath: string) {
    const fileName = getName(filePath);
    const fileExtension = (fileName.split('.').pop() || '').toLowerCase();
    return AudioFormat.includes(fileExtension);
}

function renameFileName(fileName: string) {
    return new Date().getTime() + "_" + fileName;
}

function getLimitName(fileName: string, limitCharNum?: number) {
    const name = getName(fileName);

    return name.substring(0, limitCharNum ?? 4) + "...";
}

function getName(filePath: string) {
    let fileName = filePath.split('/').pop() || '';
    fileName = fileName.split('?').shift() || '';
    return decodeURIComponent(fileName.split('_').pop() || '');
}

const file = { isVideo, isAudio, getLimitName, compressImage, preProcessImageContent, cacheImageToBase64Image, base64String2Blob, base64Data2Blob, uploadFile, uploadFiles, removeImage, isImage, getName, renameFileName, uploadBase64Data, getUploadAccept, UploadFormat };

export default file;