export interface AnimeModel {
    id: string;
    name: string;
    modelName: string;
    defaultPrompt: string;
    defaultNegativePrompt: string;
}

export const animeModels: AnimeModel[] = [
    {
        id: "mixProV4",
        name: "Mix Pro V4",
        modelName: "mixProV4_v4.safetensors",
        defaultPrompt: "Original Character, Volumetric Lighting, Best Shadows, Shallow Depth of Field, Portrait Of Stunningly Beautiful Girl, Petite, Delicate Beautiful Attractive Face With Alluring Yellow Eyes, Messy Painted Face, Sharp Eyebrows, Broadly Smiling, Open Mouth, Fangs Out, Lovely Medium Breasts, Layered Long Twintail Blond Hair, Blush Eyeshadow, Thick Eyelashes, Applejack Hat, Oversized Pop Jacket, Mini Underboob Tee, Open Navel, Slim Waist, Denim Jeans Pants, With Buckle Belt, In The Graffiti Alley, Waste Container, Outside Stairs, Outdoor Unit, Holding Spray Paint Can, Standing, (Highest Quality, Amazing Details:1.25), (Solo:1.3), Brilliant Colorful Paintings",
        defaultNegativePrompt: "(Worst Quality, Low Quality:1.4), Poorly Made Bad 3D, Lousy Bad Realistic",
    },
    {
        id: "sudachi",
        name: "Sudachi V1.0",
        modelName: "sudachi_v10_62914.safetensors",
        defaultPrompt: "masterpiece, best quality, 1girl, yellow eyes, long hair, white hair, tree, stairs, standing, kimono, sky, cherry blossoms, temple, looking at viewer, upper body, from below, looking back,",
        defaultNegativePrompt: "(worst quality, low quality:1.3),",
    },
    {
        id: "anythingV5",
        name: "Anything V5",
        modelName: "AnythingV5_v5PrtRE.safetensors",
        defaultPrompt: "masterpiece,(best quality),(1girl) ,solo,(high contrast:1.2),(high saturation:1.2), ((hands on the pocket)),((black and white sdress)),looking at viewer,((white and light blue theme:1.3)),((white and light blue background:1.5)),white hair,blue eyes,((walking:1.3)),full body,black footwear,((the light blue water on sky and white cloud and day)),((from above:1.2)),Ink painting",
        defaultNegativePrompt: "((very long hair:1.3)),messy,ocean,beach,big breast,nsfw,(((pubic))), ((((pubic_hair)))),sketch, duplicate, ugly, huge eyes, text, logo, monochrome, worst face, (bad and mutated hands:1.3), (worst quality:2.0), (low quality:2.0), (blurry:2.0), horror, geometry, bad_prompt, (bad hands), (missing fingers), multiple limbs, bad anatomy, (interlocked fingers:1.2), Ugly Fingers, (extra digit and hands and fingers and legs and arms:1.4), crown braid, ((2girl)), (deformed fingers:1.2), (long fingers:1.2),succubus wings,horn,succubus horn,succubus hairstyle, (bad-artist-anime), bad-artist, badhandv4,"
    },
    {
        id: "meinaMix",
        name: "MeinaMix V9",
        modelName: "meinamix_meinaV9.safetensors",
        defaultPrompt: "upper body, 1girl, white hair, ponytail, purple eyes, (ninja), short sword, medium breats, scarf, wallpaper, magic circle background, light particles, blue fire",
        defaultNegativePrompt: "(worst quality:2, low quality:2), (zombie, sketch, interlocked fingers, comic)"
    },
    {
        id: "counterfeitV3",
        name: "Counterfeit V3.0",
        modelName: "CounterfeitV30_v30.safetensors",
        defaultPrompt: "(masterpiece, best quality),1girl with long white hair sitting in a field of green plants and flowers, her hand under her chin, warm lighting, white dress, blurry foreground",
        defaultNegativePrompt: "EasyNegativeV2"
    },
    {
        id: "yuzu",
        name: "Yuzu V1.1",
        modelName: "yuzu_v11_81071.safetensors",
        defaultPrompt: "masterpiece, best quality, 1girl, black hair, yellow eyes, long hair, butterflys, night, upper body,",
        defaultNegativePrompt: "(worst quality, low quality:1.4)"
    },
    {
        id: "anyLora",
        name: "AnyLora Checkpoint",
        modelName: "anyloraCheckpoint_bakedvaeBlessedFp16_66208.safetensors",
        defaultPrompt: "best quality, ultra high res, 1girl, sleeveless white button shirt, black skirt, black choker, cute, (Kpop idol), (aegyo sal:1), (platinum blonde hair:1), ((puffy eyes)), looking at viewer, full body, facing front",
        defaultNegativePrompt: "sketches, (worst quality, low quality:2), FastNegativeV2"
    },
    {
        id: "meinaMixV10",
        name: "MeinaMix V10",
        modelName: "meinamix_meinaV10_55222.safetensors",
        defaultPrompt: "colorful, 1girl, white hair, purple eyes, dual wielding, sword, holding sword, blue flames, glow, glowing weapon, light particles, wallpaper, chromatic aberration,",
        defaultNegativePrompt: "(worst quality, low quality:1.4), monochrome, zombie, (interlocked fingers), cleavage,"
    },
    {
        id: "meinaPastel",
        name: "MeinaPastel V6",
        modelName: "meinapastel_v6Pastel_76316.safetensors",
        defaultPrompt: "[(Transparent background:1.5)::5],(((masterpiece))),(((best quality))),(((extremely detailed))),illustration, 1girl,solo,mysterious,vivid color,shiny, underwater transparent sealed hemispherical glass dome, (white hair),(purple eyes), full body,barefoot,long hair tranquil nature, koi,Underwater, Dome,close up,Dynamic actions,Lens perspective,(((Box composition))),sit cross-legged and lean against the bookshel, volumetric lighting, multi-color eyes, detailed eyes, hyper detailed,light smile, highly detailed, beautiful, small details, ultra detailed, best quality, intricate, 4k, 8k, trending on artstation, good anatomy, beautiful lighting, award-winning,",
        defaultNegativePrompt: "(worst quality, low quality:1.4), monochrome, zombie, (interlocked fingers),"
    },
    {
        id: "anythingV5Ink",
        name: "Anything V5 Ink",
        modelName: "AnythingV5Ink_v32Ink_62542.safetensors",
        defaultPrompt: "([balloons:Small planets:0.5]:1.4), (Small_planets inside of balloons:1.4), (lots of colorful Small_planets:1.35)\n(colorful planets, earth, floating petals, big balloons:1.22),\n1 girl, cute face,\nFull body, sitting, detailed beautiful eyes, bare legs, costume combination, Goddess, perfect body, [nsfw:0.88]\n(sitting on ice_planet:1.22)\n(lots of [floting blue Butterflies:floting ice:0.4]:1.22)\n(detailed light), (an extremely delicate and beautiful), volume light, best shadow,cinematic lighting, Depth of field, dynamic angle, Oily skin,",
        defaultNegativePrompt: "(worst quality, low quality, blurry:1.66), (bad hand:1.4), watermark, (greyscale:0.88), multiple limbs, (deformed fingers, bad fingers:1.2), (ugly:1.3), monochrome, horror, geometry, bad anatomy, bad limbs, (Blurry pupil), (bad shading), error, bad composition, Extra fingers, strange fingers, Extra ears, extra leg, bad leg, disability, Blurry eyes, bad eyes, Twisted body, confusion, (bad legs:1.3)"
    },
    {
        id: "meinaMixV11",
        name: "MeinaMix V11",
        modelName: "meinamix_meinaV11_85291.safetensors",
        defaultPrompt: "1girl, japanese clothes, ponytail, white hair, purple eyes, magic circle, blue fire, blue flames, wallpaper, landscape, blood, blood splatter, depth of field, night, light particles, light rays, sidelighting, thighs, fate (series), genshin impact, open jacket, skirt, thighhighs, cloud",
        defaultNegativePrompt: "(worst quality:1.6, low quality:1.6), (zombie, sketch, interlocked fingers, comic)"
    },
    {
        id: "cMoon",
        name: "cMoon V0.0",
        modelName: "cMoon_v00_11751.safetensors",
        defaultPrompt: "best quality, (masterpiece), Ultra-detailed, (high resolution:1.1), (bold line), (sharp line), 1girl, school uniform, long necktie, annoyed, (embrassed), perfect face, beautiful face, in classroom, buttoned white shirt, darkbrown hair|black hair, black stockings, tied up hair, medium hair, dynamic angle, (speaking text)",
        defaultNegativePrompt: "(Low quality, worst quality:1.4), bad anatomy, bad hands, 3d, blurry, lowers, low resolution, text, watermark, multiple panels, multiple views, (obi, kimono)"
    },
    {
        id: "meinaPastelV5",
        name: "MeinaPastel V5 Anime Illustration",
        modelName: "meinapastel_v5AnimeIllustration.safetensors",
        defaultPrompt: "(masterpiece:1.2, best quality), (finely detailed beautiful eyes: 1.2), (extremely detailed CG unity 8k wallpaper, masterpiece, best quality, ultra-detailed, best shadow), (detailed background), (beautiful detailed face, beautiful detailed eyes), High contrast, (best illumination, an extremely delicate and beautiful),1girl,((colourful paint splashes on transparent background, dulux,)), dynamic angle,beautiful detailed glow,full body, cowboy shot, white hair, purple eyes,",
        defaultNegativePrompt: "(worst quality, low quality:1.4), zombie, (interlocked fingers), [monochrome:0.8]"
    },
    {
        id: "cetusMix",
        name: "CetusMix Whalefall 2",
        modelName: "cetusMix_Whalefall2_74526.safetensors",
        defaultPrompt: "1girl,night city,rain,coat,hands in pockets",
        defaultNegativePrompt: "(worst quality:1.6),(low quality:1.6), easynegative,"
    },
    {
        id: "counterfeitV3025",
        name: "Counterfeit V3.0.25",
        modelName: "CounterfeitV30_25_7496.safetensors",
        defaultPrompt: "((masterpiece,best quality)),2girls, black kimono, black legwear, black ribbon, black hair, cherry blossoms, day, flower, hair bun, hair ribbon, japanese clothes, kimono, long hair, looking at viewer, looking back, multiple girls, obi, outdoors, red eyes, red hair, ribbon, sandals, single hair bun, stairs, standing, statue, torii, tree, white kimono, yellow eyes",
        defaultNegativePrompt: "EasyNegative, extra fingers,fewer fingers,"
    },
]; 