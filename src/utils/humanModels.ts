export interface HumanModel {
    id: string;
    name: string;
    modelName: string;
    defaultPrompt: string;
    defaultNegativePrompt: string;
}

export const humanModels: HumanModel[] = [
    {
        id: "chilloutmix",
        name: "ChilloutMix Ni",
        modelName: "chilloutmix_Ni_8761.safetensors",
        defaultPrompt: "best quality, ultra high res, (photorealistic:1.4), 1 girl, bikini, (ulzzang-6500:1.0), (style-keta:0.8)",
        defaultNegativePrompt: "paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), bad anatomy, large breast, nsfw"
    },
    {
        id: "majicmix",
        name: "MajicMix Realistic",
        modelName: "chilloutmix_NiPrunedFp32_9174.safetensors",
        defaultPrompt: "(RAW photo, best quality), (realistic, photo-realistic:1.3), best quality, masterpiece, an extremely delicate and beautiful, extremely detailed, CG, unity, 2k wallpaper, Amazing, finely detail, masterpiece, light smile, best quality, extremely detailed CG unity 8k wallpaper, huge filesize, ultra-detailed, highres, extremely detailed, 1girl, casual outfit, hair ornament, looking at viewer, pureerosface_v1:0.8",
        defaultNegativePrompt: "nsfw, nude, naked, EasyNegative, paintings, sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, extra fingers, fewer fingers, ((watermark:2)), (white letters:1), lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, bad feet, {Multiple people}, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark"
    }
    // Thêm các mô hình khác tại đây
]; 