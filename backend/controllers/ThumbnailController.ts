import { Request, Response } from "express";

import Thumbnail from "../models/Thumbnail.js";
import { GenerationConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import ai from "../config/ai.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary"



const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}
const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
        const thumbnail = await Thumbnail.create({
            userId,
            title,
            prompt_used: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            isGenerating: true,


        })
        const model = 'gemini-3-pro-image-preview'
        // const generationConfig: GenerationConfig = {
        //     maxOutputTokens: 32768,
        //     temperature: 1,
        //     topP: 0.95,
        //   responseModalities: ["IMAGE"],
        //     imageConfig: {
        //        aspectRatio: aspect_ratio || "16:9",
        //         imageSize: "1K"
        //     },
        //     safetySettings: [
        //         {
        //             category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        //             threshold: HarmBlockThreshold.OFF
        //         },
        //         {
        //             category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        //             threshold: HarmBlockThreshold.OFF
        //         },
        //         {
        //             category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        //             threshold: HarmBlockThreshold.OFF
        //         },
        //         {
        //             category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        //             threshold: HarmBlockThreshold.OFF
        //         }

        //     ]
        // }
        const generationConfig: GenerationConfig = {
    maxOutputTokens: 32768,
    temperature: 1,
    topP: 0.95,
    responseModalities: ["IMAGE"],
    imageConfig: {
        aspectRatio: aspect_ratio ?? "16:9",
        imageSize: "1024x1024"
    },
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
        }
    ]
};
        let prompt = `create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}" `
        if (color_scheme) {
            prompt += `use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme`
        }
        if (user_prompt) {
            prompt += `Additional details : ${user_prompt}`
        }
        prompt += `The thumbnail should be  ${aspect_ratio} , visually stunning 
        and designed to maximize click-through rates.Make it bold , professional and impossible to ignore.`
        // generate the image 
        const response: any = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generationConfig
        })

        // check the error 
        if (!response?.candidate?.[0]?.content.parts) {
            throw new Error("unexpected response")
        }
        const parts = response.candidate[0].content.parts;
        let finaleBuffer: Buffer | null = null;
        for (const part of parts) {
            if (part.inlineData) {
                finaleBuffer = Buffer.from(part.inlineData, "base64")
            }
        }
        const filename = ` finale-output ${Date.now()}.png`
        const filePath = path.join("images", filename)


        fs.mkdirSync("images", { recursive: true })


        // write the finale image to the file
        fs.writeFileSync(filePath, finaleBuffer!)
        const uploadOnCloudinary = await cloudinary.uploader.upload(filePath, { resource_type: "image" })
        thumbnail.image_url = uploadOnCloudinary.url
        thumbnail.isGenerating = false;
        await thumbnail.save();

        res.json({
            message: "thumbnail generated successfully",
            thumbnail
        })

        // remove the local file after uploading to cloudinary
        fs.unlinkSync(filePath)


    } catch (error: any) {

        console.log(error)
        res.status(500).json({
            message: error.message || "something went wrong while generating thumbnail"

        })


    }

}


export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { thumbnailId } = req.params;
        const  {userId} = req.body;

        await Thumbnail.findOneAndDelete({_id: thumbnailId, userId})

        res.json({
            message: "thumbnail deleted successfully"
        })
    } catch (error: any) {
         console.log(error)
        res.status(500).json({
            message: error.message || "something went wrong while deleting thumbnail"
        
    }
        )
       }


    }
