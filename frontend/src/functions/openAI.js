import OpenAI from "openai";
import React from 'react';

export async function UseOpenAI(prompt) {
    const openai = new OpenAI({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });

        try {
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });
            const imageUrl = response.data[0].url;
            console.log(imageUrl);
            return imageUrl; // Return the URL for use in the component
        } catch (error) {
            console.error('Error generating image:', error);
            return null; // Return null or handle the error as needed
        }
    }

   

