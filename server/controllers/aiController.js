import {GoogleGenAI} from '@google/genai';
import asyncHandler from 'express-async-handler';

const ai = new GoogleGenAI({});

export const generateContent = asyncHandler(async(req, res) => {
    const {topic, keywords, tone, length, existingContent} = req.body;

    if(!topic){
        res.status(400);
        throw new Error('Please provide a topic or idea for content generation.');
    }

    const systemInstruction = `You are a professional blog content assistant. Your task is to generate compelling, SEO-optimized, and well-structured blog content in Markdown format. 
    The post should be engaging and relevant to the user's input. Do not include any introductory phrases like "Here is your blog post."`;

    const userPrompt = `Generate a blog post.
    Topic/Title Idea: "${topic}"
    Keywords to include: ${keywords ? keywords.join(', ') : 'None'}
    Desired Tone: ${tone || 'professional and engaging'}
    Desired Length: ${length || 'Medium (approx. 800 words)'}
    ${existingContent ? `Use this existing draft as context for expansion/refinement: ${existingContent}` : ''}
    
    Structure the response with clear Markdown headings (H2s and H3s).`;

    try{
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                maxOutputTokens: 4096
            }
        });

        const generatedText = response.text;

        if(!generatedText){
            res.status(500);
            throw new Error('AI failed to generate content. Please try again.');
        }

        res.status(200).json({ 
            success: true, 
            data: { 
                content: generatedText,
                isAI: true 
            } 
        });
    } catch(error){
        console.error('Gemini API Error:', error);
        res.status(500);
        throw new Error('An error occurred during AI content generation.');
    }
})